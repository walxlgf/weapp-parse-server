
const APPID = 'wxc14d0ff891dbbb64';
const SECRET = '654f6c6559336fa79d13c85e4cb2e080';


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