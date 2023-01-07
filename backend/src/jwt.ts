import jwt from "jsonwebtoken";

const enc = jwt.sign({ user: "stuff" }, "heyheyhey");

console.log("enc :>> ", enc);
