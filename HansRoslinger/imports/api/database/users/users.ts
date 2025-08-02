import { hashPassword } from "./util";
import { Mongo } from "meteor/mongo";

export interface User {
  email: string;
  password: string;
  createdAt: Date;
}

export const UserCollection = new Mongo.Collection<User>("users");
UserCollection.allow({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

export async function createUser(user: User): Promise<string> {
  return await UserCollection.insertAsync(user);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return await UserCollection.findOneAsync({ email });
}

export async function updateUser(
  email: string,
  updates: Partial<User>,
): Promise<number> {
  return await UserCollection.updateAsync({ email }, { $set: updates });
}

export async function deleteUser(email: string): Promise<number> {
  return await UserCollection.removeAsync({ email });
}

export async function doesUserExist(email: string): Promise<boolean> {
  const user = await UserCollection.findOneAsync({ email });
  return !!user;
}

export async function correctLogin(email: string, password: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  if (!user) return false;
  const hashed = hashPassword(password);
  return user.password === hashed;
}