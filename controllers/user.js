import User from "../models/user.js";
import { hashPassword } from "../utils/auth.js"

const UserController = {
  getUser: async (req, res) => {
    try {
      const data = await User.findById(req.params._id).select("-password");
      return res.status(200).json({ message: data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await User.find({}).select("-password");
      res.status(200).json({ message: users });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const params = req.body;
      const images = req.files.images ? req.files.images.map(file => file.filename) : [];      
      if (images) {
        params.images = images;  // Add images to the params object
      }

      console.log(images);

      const updatedProduct = await User.findByIdAndUpdate(
        req.params._id,
        params,
        { new: true }
      );

      return res.status(200).json({ message: updatedProduct });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err.message });
    }
  },
  updateUserImg: async (req, res) => {
    try {
      // Extract file names from the uploaded files
      const images = req.files.images ? req.files.images.map(file => file.filename) : [];
  
      // Update the user document with the new images
      const updatedProduct = await User.findByIdAndUpdate(
        req.params._id, // Use req.params._id to get the user ID from the route parameters
        { $set: { images: images } }, // Use $set to update the images field
        { new: true } // Return the updated document
      );
  
      // Return the updated user data
      return res.status(200).json({ message: updatedProduct });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err.message });
    }
  },
  
  addUser: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name)
        throw new Error("Email, name and password is required !");

      const hashedPassword = await hashPassword(password);

      const user = await User.create({
        email,
        name,
        password:hashedPassword,
        role:"ADMIN"
      });

      res.status(200).json({
        message: user,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err.message });
    }
  },
};

export default UserController;
