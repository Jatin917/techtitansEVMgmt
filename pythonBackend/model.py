import pandas as pd
import numpy as np
from sklearn.neighbors import BallTree  # <-- Missing import
from sklearn.cluster import KMeans, MiniBatchKMeans
from sklearn.preprocessing import StandardScaler
from geopy.distance import geodesic
import folium
from joblib import Parallel, delayed

class ChargingStationOptimizer:
    def __init__(self, ev_data_path, stations_path):
        """Initialize with EV data and existing stations"""
        self.ev_data = pd.read_csv(ev_data_path)
        self.stations = pd.read_csv(stations_path)
        self._fast_distance_calculation()
        
    def _preprocess_data(self):
        """Prepare data for clustering"""
        # Calculate distance to nearest station
        self.ev_data['nearest_station_km'] = self.ev_data.apply(
            lambda row: min(geodesic(
                (row['latitude'], row['longitude']),
                (station['latitude'], station['longitude'])
            ).km for _, station in self.stations.iterrows()),
            axis=1
        )
        
        # Normalize features
        self.ev_data['norm_demand'] = (
            self.ev_data['assigned_vehicles'] / self.ev_data['assigned_vehicles'].max()
        )
        self.ev_data['norm_distance'] = (
            self.ev_data['nearest_station_km'] / self.ev_data['nearest_station_km'].max()
        )

    def _fast_distance_calculation(self):
        """Vectorized distance calculation using BallTree"""
        # Convert to radians for haversine metric
        ev_points = np.radians(self.ev_data[['latitude', 'longitude']].values)
        station_points = np.radians(self.stations[['latitude', 'longitude']].values)
        
        # Earth radius in km
        earth_radius = 6371
        
        # Build BallTree for stations
        tree = BallTree(station_points, metric='haversine')
        
        # Query nearest station for each EV point
        distances, _ = tree.query(ev_points, k=1)
        self.ev_data['nearest_station_km'] = distances * earth_radius
        
        # Normalize
        self.ev_data['norm_demand'] = (
            self.ev_data['assigned_vehicles'] / self.ev_data['assigned_vehicles'].max()
        )
        self.ev_data['norm_distance'] = (
            self.ev_data['nearest_station_km'] / self.ev_data['nearest_station_km'].max()
        )

    def cluster_analysis(self, n_clusters=5):
        """Identify optimal clusters using K-means"""
        X = self.ev_data[['norm_demand', 'norm_distance']].values
        X_scaled = StandardScaler().fit_transform(X)
        
        # Perform K-means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        self.ev_data['cluster'] = kmeans.fit_predict(X_scaled)
        
        # Find priority cluster
        cluster_stats = self.ev_data.groupby('cluster').agg({
            'norm_demand': 'mean',
            'norm_distance': 'mean'
        })
        cluster_stats['priority'] = 0.7*cluster_stats['norm_demand'] + 0.3*cluster_stats['norm_distance']
        self.best_cluster = cluster_stats['priority'].idxmax()
        
        return self.ev_data[self.ev_data['cluster'] == self.best_cluster]

    def add_station(self, lat, lon):
        """Add new station and update clusters"""
        new_station = pd.DataFrame([[lat, lon]], columns=['latitude', 'longitude'])
        self.stations = pd.concat([self.stations, new_station], ignore_index=True)
        
        # Recalculate distances and clusters
        # self._preprocess_data()
        self._fast_distance_calculation()
        self.cluster_analysis()
        
        return self.get_optimal_locations()

    def get_optimal_locations(self, n_locations=5, min_distance_km=1.0):
        """Get best locations from priority cluster"""
        candidates = self.ev_data[
            (self.ev_data['cluster'] == self.best_cluster) &
            (self.ev_data['nearest_station_km'] >= min_distance_km)
        ]
        
        # Score candidates
        candidates['placement_score'] = (
            0.6 * candidates['norm_demand'] +
            0.3 * candidates['norm_distance'] +
            0.1 * (candidates['nearest_station_km'] / candidates['nearest_station_km'].max()))
        
        return candidates.nlargest(n_locations, 'placement_score')

    def visualize(self):
          """Create interactive map with guaranteed integer cluster handling"""
          # Ensure clusters are integers (handles numpy.float, string, etc.)
          self.ev_data['cluster'] = pd.to_numeric(self.ev_data['cluster'], errors='coerce').fillna(0).astype(int)
          
          # Create map
          m = folium.Map(
              location=[self.ev_data['latitude'].mean(), self.ev_data['longitude'].mean()],
              zoom_start=12
          )
          
          # Color mapping with fallback
          cluster_colors = {
              0: 'red',
              1: 'blue',
              2: 'green',
              3: 'purple',
              4: 'orange',
              5: 'darkred',
              'default': 'gray'
          }
          
          # Add EV points
          for _, row in self.ev_data.iterrows():
              # Get color with fallback
              color = cluster_colors.get(row['cluster'], cluster_colors['default'])
              
              folium.CircleMarker(
                  location=[row['latitude'], row['longitude']],
                  radius=3 + 7 * row['norm_demand'],
                  color=color,
                  fill=True,
                  fill_opacity=0.6,
                  popup=f"""
                  <b>Cluster {row['cluster']}</b><br>
                  EVs: {row['assigned_vehicles']}<br>
                  Nearest Station: {row['nearest_station_km']:.1f}km
                  """
              ).add_to(m)
          
          # Add existing stations
          for _, row in self.stations.iterrows():
              folium.Marker(
                  [row['latitude'], row['longitude']],
                  icon=folium.Icon(color='black', icon='plug', prefix='fa'),
                  popup="Existing Station"
              ).add_to(m)
          
          # Add optimal locations
          optimal_locs = self.get_optimal_locations()
          for _, row in optimal_locs.iterrows():
              folium.Marker(
                  [row['latitude'], row['longitude']],
                  icon=folium.Icon(color='pink', icon='star', prefix='fa'),
                  popup=f"""
                  <b>Recommended Location</b><br>
                  Score: {row['placement_score']:.2f}<br>
                  Demand: {row['assigned_vehicles']} EVs<br>
                  Distance to Station: {row['nearest_station_km']:.1f}km
                  """
              ).add_to(m)
          
          return m


