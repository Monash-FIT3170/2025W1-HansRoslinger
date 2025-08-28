import { hashPassword } from "./util";
import { Mongo } from "meteor/mongo";
import { GestureType, FunctionType } from "/imports/gesture/gesture";

export type GestureSettings = Record<GestureType, FunctionType>;

export interface User {
  email: string;
  password: string;
  createdAt: Date;
  settings: GestureSettings;
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

export async function updateUserSettings(
  email: string,
  settings: GestureSettings,
): Promise<number> {
  return await UserCollection.updateAsync(
    { email },
    { $set: { settings } }
  );
}

export async function getUserSettings(
  email: string,
): Promise<GestureSettings> {
  const user = await UserCollection.findOneAsync(
    { email },
    { projection: { settings: 1, _id: 0 } }
  );
  return user?.settings as GestureSettings | {
    [GestureType.THUMB_UP]: FunctionType.UNUSED,
    [GestureType.THUMB_DOWN]: FunctionType.UNUSED,
    [GestureType.POINTING_UP]: FunctionType.SELECT,
    [GestureType.CLOSED_FIST]: FunctionType.CLEAR,
    [GestureType.I_LOVE_YOU]: FunctionType.UNUSED,
    [GestureType.UNIDENTIFIED]: FunctionType.UNUSED,
    [GestureType.OPEN_PALM]: FunctionType.FILTER,
    [GestureType.VICTORY]: FunctionType.ZOOM,
  };
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

export async function correctLogin(
  email: string,
  password: string,
): Promise<boolean> {
  const user = await getUserByEmail(email);
  if (!user) return false;
  const hashed = hashPassword(password);
  return user.password === hashed;
}
