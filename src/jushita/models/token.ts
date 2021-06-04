import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Token = new Schema({
    created_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
    }, { strict: false }
);
const TokenModel = mongoose.model('jushita_tokens', Token);
export { TokenModel };
