import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Token = new Schema({
    wangwang_id: { type: String, default: '', trim: true, maxlength: 400 },
    token: { type: String, default: '', trim: true, maxlength: 1000 },
    shop_type: { type: String, default: '', trim: true, maxlength: 1000 },
    created_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
});
const TokenModel = mongoose.model('jushita_tokens', Token);
export { TokenModel };
