const Joi = require('joi');
const Account = require('models/account');

// 인증 되어있는 회원인지 확인
exports.check = async (ctx) => {
    const { user } = ctx.request;

    if (!user) {
        ctx.status = 401; // Unauthorized
        return;
    }

    ctx.body = user;
};

// 로컬 회원가입
exports.localRegister = async (ctx) => {
    // 데이터 검증
    const schema = Joi.object().keys({
        username: Joi.string().alphanum().min(4).max(15).required(),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6)
    });

    const result = Joi.validate(ctx.request.body, schema);

    if(result.error) {
        ctx.status = 400; // Bad request
        return;
    }

    // 아이디 / 이메일 중복 체크
    try {
        const existing = await Account.findByEmailOrUsername(ctx.request.body);
        if(existing) {
            // 중복되는 아이디/이메일이 있을 경우
            ctx.status = 409; // Conflict
            // 어떤 값이 중복되었는지 알려줍니다
            ctx.body = {
                key: existing.email === ctx.request.body.email ? 'email' : 'username'
            };
            return;
        }
    } catch (e) {
        ctx.throw(500, e);
    }

    // 계정 생성
    try {
        const account = await Account.localRegister(ctx.request.body);
        const token = await account.generateToken();
        ctx.cookies.set('access_token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        ctx.body = account.profile; // 프로필 정보로 응답합니다.
    } catch (e) {
        ctx.throw(500, e);
    }
};

// 로컬 로그인
exports.localLogin = async (ctx) => {
    // 데이터 검증
    const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const result = Joi.validate(ctx.request.body, schema);

    if(result.error) {
        ctx.status = 400; // Bad Request
        return;
    }

    const { email, password } = ctx.request.body; 

    try {
        // 이메일로 계정 찾기
        const account = await Account.findByEmail(email);
        if(!account || !account.validatePassword(password)) {
        // 유저가 존재하지 않거나 || 비밀번호가 일치하지 않으면
            ctx.status = 403; // Forbidden
            return;
        }
        const token = await account.generateToken();
        ctx.cookies.set('access_token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        ctx.body = account.profile;
    } catch (e) {
        ctx.throw(500, e);
    }
};

// 이메일 / 아이디 존재유무 확인
exports.exists = async (ctx) => {
    const { key, value } = ctx.params;

    try {
        // key 에 따라 findByEmail 혹은 findByUsername 을 실행합니다.
        const account = await (key === 'email' ? Account.findByEmail(value) : Account.findByUsername(value));  
        ctx.body = {
            exists: account !== null
        };  
    } catch (e) {
        ctx.throw(500, e);
    }
};

// 로그아웃
exports.logout = async (ctx) => {
    ctx.cookies.set('access_token', null, {
        maxAge: 0,
        httpOnly: true
    });
    ctx.status = 204;
};