"use server";

import User from "@/models/user.model.js";
import { connect } from "@/db/dbConfig.js";

export async function createUser(user) {
  try {
    await connect();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.log(error);
  }
}