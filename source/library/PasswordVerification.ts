import bcrypt from "bcrypt";

let validatePassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
}
export {validatePassword}