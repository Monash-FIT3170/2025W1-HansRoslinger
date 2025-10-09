import { verifyPassword } from "./util";
import { Mongo } from "meteor/mongo";
import {
  GestureType,
  FunctionType,
  defaultMapping,
} from "/imports/gesture/gesture";

export interface User {
  _id: string;
  email: string;
  password: string;
  createdAt: Date;
  settings: Record<GestureType, FunctionType>;
  _recent_presentation_id?: string;
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

export async function getUserById(_id: any): Promise<User | undefined> {
  return await UserCollection.findOneAsync({ _id });
}

export async function updateUserSettings(
  _id: string,
  settings: Record<GestureType, FunctionType>,
): Promise<number> {
  return await UserCollection.updateAsync(_id, { $set: { settings } });
}

export async function getUserSettings(
  email: string,
): Promise<Record<GestureType, FunctionType>> {
  const user = await UserCollection.findOneAsync(
    { email },
    { projection: { settings: 1, _id: 0 } },
  );

  if (user) {
    const result = {} as Record<GestureType, FunctionType>;

    Object.entries(user.settings).forEach(([key, value]) => {
      const gestureKey = Number(key) as GestureType;
      const functionValue = value as FunctionType;
      result[gestureKey] = functionValue;
    });

    Object.values(GestureType)
      .filter((v) => typeof v === "number")
      .forEach((g: number) => {
        if (result[g as GestureType] === undefined) {
          result[g as GestureType] = FunctionType.UNUSED;
        }
      });

    return result;
  } else {
    return defaultMapping;
  }
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
  return verifyPassword(password, user.password);
}

export async function getRecentPresentationId(
  userId: string,
): Promise<string | undefined> {
  const user = await UserCollection.findOneAsync(
    { _id: userId },
    { projection: { _recent_presentation_id: 1, _id: 0 } },
  );
  return user?._recent_presentation_id;
}

export async function updateRecentPresentationId(
  userId: string,
  presentationId: string,
): Promise<number> {
  return await UserCollection.updateAsync(
    { _id: userId },
    { $set: { _recent_presentation_id: presentationId } },
  );
}
