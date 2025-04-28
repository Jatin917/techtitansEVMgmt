import users from '../models/auth.js'
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const extinguser = await users.findOne({ email });
        if (extinguser) {
            return res.status(404).json({ message: "User already exist" });
        }
        const hashedpassword = await bcrypt.hash(password, 12);
        const newuser = await users.create({
            name,
            email,
            password: hashedpassword
        });
        const token = jwt.sign({
            email: newuser.email, id: newuser._id
        }, process.env.JWT_SECRET, { expiresIn: "1h" }
        )
        res.status(200).json({ result: newuser, token });
    } catch (error) {
        res.status(500).json({message:error.message})
        return
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const extinguser = await users.findOne({ email });
        if (!extinguser) {
            return res.status(404).json({ message: "User does not exists" })
        }
        const ispasswordcrct = await bcrypt.compare(password, extinguser.password);
        if (!ispasswordcrct) {
            res.status(400).json({ message: "Invalid credentiasl" });
            return
        }
        const token = jwt.sign({
            email: extinguser.email, id: extinguser._id
        }, process.env.JWT_SECRET, { expiresIn: "1h" }
        )

        res.status(200).json({ result: extinguser, token })
    } catch (error) {
        res.status(500).json({message:error.message})
        return
    }
}

export const googleAuth = async (req, res) => {
    try {
        console.log(req.user)
        const { name, email, picture } = req.user;
        let user = await users.findOne({ email });
        if (!user) {
            user = await users.create({
                name,
                email,
                provider: "google",
                profilePicture:picture
            });
            if (!user) {
                return res.status(500).json({
                    message: "User  creation failed",
                });
            }
        }
        const token = jwt.sign({
            email: user.email, id: user._id
        }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ result: user, token });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
}