
const APPID = 'wxc14d0ff891dbbb64';
const SECRET = '654f6c6559336fa79d13c85e4cb2e080';



Parse.Cloud.define('weappAuthOnlyCode', (req) => {
  console.log(`cloud:weappauth:code:${req.params.code}`)
  var openid;
  let isSignUp = false;
  //获取openId 
  Parse.Cloud.httpRequest({
    url: 'https://api.weixin.qq.com/sns/jscode2session',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    params: {
      appid: APPID,
      secret: SECRET,
      js_code: req.params.code,
      grant_type: 'authorization_code',
    }
    // }, { useMasterKey: true }).then(function (httpResponse) {
  }).then(function (httpResponse) {
    openid = httpResponse.data.openid;
    console.log(`cloud:weappAuthOnlyCode:openid:${openid}`)
    //判断是否存在此用户
    var query = new Parse.Query(Parse.User);
    query.equalTo("username", openid);
    return query.first();
  }).then(function (user) {
    //如果存在登录
    if (user) {
      console.log(`cloud:weappAuthOnlyCode:login:`)
      return Parse.User.logIn(openid, openid);
    } else {
      console.log(`cloud:weappAuthOnlyCode:signUp:`)
      isSignUp = true;
      //如果不存在 注册
      var user = new Parse.User();
      user.set("username", openid);
      user.set("password", openid);
      return user.signUp(null);
    }
  }).then(function (user) {
    console.log(`cloud:weappAuthOnlyCode:user:${user.get('username')}`);
    // Parse.Cloud.run('signUpJob', { uesr:'user' });
    singUpFuction(user);
    // res.success(user);
    return user;
    // console.log(`cloud:weappAuthOnlyCode:user1:${user1.get('username')}`);
  }, function (user, error) {
    // res.error(error);
    // console.error(`cloud:weappAuthOnlyCode:user:${user} error:${user}`);
  });
  // .catch(() => {
  //   response.error(`cloud:weappAuthOnlyCode:catch`);
  // });

});

function singUpFuction (user){
  console.log(`cloud:singUpFuction:user:${user}`);
}


Parse.Cloud.job("signUpJob", function (request, status) {
  // the params passed through the start request
  const params = request.params;
  // Headers from the request that triggered the job
  const headers = request.headers;
  // get the parse-server logger
  const log = request.log;

  //如果是注册 新建一个属于这个用户的角色  用于共享
  //1、新建role
  //2、把user加入这个role的users属性中
  //3、user中新一个属性ownrole指向这个role
  //4、复制公共比赛
  //5、复制公共盲注模板
  let user = params.user;

  console.log(`cloud:signUpJob:user:${user}`);
  // Update the Job status message
  // status.message("I just started");
  // doSomethingVeryLong().then(function (result) {
  //   // Mark the job as successful
  //   // success and error only support string as parameters
  //   status.success("I just finished");
  // }).catch(function (error) {
  //   // Mark the job as errored
  //   status.error("There was an error");
  // });
});

Parse.Cloud.define('weappauth', (req, res) => {
  console.log(`cloud:weappauth:code:${req.params.code}`)
  var openid;
  //获取openId 
  Parse.Cloud.httpRequest({
    url: 'https://api.weixin.qq.com/sns/jscode2session',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    params: {
      appid: APPID,
      secret: SECRET,
      js_code: req.params.code,
      grant_type: 'authorization_code',
    }
    // }, { useMasterKey: true }).then(function (httpResponse) {
  }).then(function (httpResponse) {
    openid = httpResponse.data.openid;
    console.log(`cloud:weappauth:openid:${openid}`)
    //判断是否存在此用户
    var query = new Parse.Query(Parse.User);
    query.equalTo("username", openid);
    return query.first();
  }).then(function (user) {
    if (user) {
      console.log(`cloud:weappauth:login:`)
      return Parse.User.logIn(openid, openid);
    } else {
      var user = new Parse.User();
      user.set("username", openid);
      user.set("password", openid);
      console.log(`cloud:weappauth:signup:nickName:${req.params.nickName}`)
      user.set("nickName", req.params.nickName);
      user.set("gender", req.params.gender);
      user.set("language", req.params.language);
      user.set("city", req.params.city);
      user.set("province", req.params.province);
      user.set("country", req.params.country);
      user.set("avatarUrl", req.params.avatarUrl);
      return user.signUp(null);
    }
  }).then(function (user) {
    console.log(`cloud:weappauth:user:${JSON.stringify(user)}`);
    res.success(user);
  }, function (user, error) {
    res.error(error)
    console.error(`cloud:weappauth:user:${user} error:${user}`);
  });

});



Parse.Cloud.beforeSave("Device", function (request, response) {
  const query = new Parse.Query("Device");
  query.count()
    .then(function (count) {
      let device = request.object;
      console.log(`beforeSave:Device:${device.get('uuid')}`)
      if (!device.get('uuid')) {
        if (count <= 0) {
          count = 1;
        }
        else {
          count++;
        }
        let uuid = '';
        if (count < 10) {
          uuid = `000${count}`;
        } else if (count < 100) {
          uuid = `00${count}`;
        } else if (count < 1000) {
          uuid = `0${count}`;
        } else if (count < 10000) {
          uuid = `${count}`;
        } else {
          uuid = `${count}`;
        }
        device.set('uuid', uuid);
      }
      response.success();
    }, function (error) {
      response.error(error);
    })
});