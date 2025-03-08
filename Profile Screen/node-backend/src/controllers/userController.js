import UserService from "../services/userService.js";
import User from "../models/userModel.js";

const userService = new UserService(User);

export const registerUser = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await userService.getUser(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const authenticateUser = async (req, res) => {
  try {
    const user = await userService.authenticateUser(
      req.body.email,
      req.body.password
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
