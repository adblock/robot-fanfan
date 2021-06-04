import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Token = new Schema({}, { strict: false });
const TokenModel = mongoose.model('jushita_tokens', Token);
export { TokenModel };
