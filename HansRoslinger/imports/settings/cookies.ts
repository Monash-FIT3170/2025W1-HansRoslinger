import { Cookies } from 'meteor/ostrio:cookies';
const timeout = 1000*60*60

export async function encrypt(payload: any) {
  return payload
}
  
export async function decrypt(payload: any) {
  return payload
}

export async function setCookie(name: string, data: any) {
    const expires = new Date(Date.now() + timeout)
    const info = await encrypt({ data, expires });
    Cookies().set(name, info, { expires, httpOnly: true });
}

export async function getCookie(name: string) {
    const info = Cookies().get(name)?.value;
    if (!info) {
        return null;
    }
    const data = await decrypt(info);
    return data
}
