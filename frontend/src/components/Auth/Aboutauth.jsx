import React from 'react'
import { staticTranslator } from '../../services';

const Aboutauth = () => {
  const targetLang = localStorage.getItem("lang");
  return (
    <div className="auth-container-1">
      <h1>{staticTranslator("Join the Stack Overflow community", targetLang)}</h1>
      <p>{staticTranslator("Get unstuck — ask a question", targetLang)}</p>
      <p>{staticTranslator("Unlock new privileges like voting and commenting", targetLang)}</p>
      <p>{staticTranslator("Save your favorite tags, filters, and jobs", targetLang)}</p>
      <p>{staticTranslator("Earn reputation and badges", targetLang)}</p>
      <p style={{ fontSize: "13px", color: "#666767" }}>
        {staticTranslator("Collaborate and share knowledge with a private group for", targetLang)}
      </p>
      <p style={{ fontSize: "13px", color: "#007ac6" }}>
        {staticTranslator("Get Stack Overflow for Teams free for up to 50 users.", targetLang)}
      </p>
    </div>
  )
}

export default Aboutauth