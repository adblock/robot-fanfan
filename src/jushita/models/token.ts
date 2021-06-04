import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Token = new Schema({
    client_id: { type: Number, default: '', trim: true},
    wangwang_id: { type: String, default: '', trim: true},
    w1_expires_in:  { type: String, default: '', trim: true},
    refresh_token_valid_time:  { type: Number, default: '', trim: true},
    taobao_user_nick:  { type: String, default: '', trim: true},
    re_expires_in: { type: Number, default: '', trim: true},
    expire_time: { type: Number, default: '', trim: true},
    token_type: { type: String, default: '', trim: true},
    access_token: { type: String, default: '', trim: true},
    taobao_open_uid: { type: String, default: '', trim: true},
    w1_valid: { type: Number, default: '', trim: true},
    refresh_token: { type: String, default: '', trim: true},
    w2_expires_in: { type: Number, default: '', trim: true},
    w2_valid: { type: Number, default: '', trim: true},
    r1_expires_in: { type: Number, default: '', trim: true},
    r2_expires_in: { type: Number, default: '', trim: true},
    r2_valid: { type: Number, default: '', trim: true},
    r1_valid: { type: Number, default: '', trim: true},
    taobao_user_id: { type: String, default: '', trim: true},
    expires_in: { type: Number, default: '', trim: true},
    created_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
});
const TokenModel = mongoose.model('jushita_tokens', Token);
export { TokenModel };
