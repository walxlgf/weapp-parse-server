
const APPID = 'wxc14d0ff891dbbb64';
const SECRET = '654f6c6559336fa79d13c85e4cb2e080';


Parse.Cloud.define('wechatLogin', (req, res) => {
  // Parse.Cloud.useMasterKey();
  var code = req.params.code;
  console.log(`cloud:wechatLogin:code:${code}`)
  var openid;
  var session_key;
  //获取openId 
  Parse.Cloud.httpRequest({
    url: 'https://api.weixin.qq.com/sns/jscode2session',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    params: {
      appid: APPID,
      secret: SECRET,
      js_code: code,
      grant_type: 'authorization_code',
    }
  }, { useMasterKey: true }).then(function (httpResponse) {
    openid = httpResponse.data.openid;
    session_key = httpResponse.data.session_key
    console.log(`cloud:wechatLogin:openid:${openid}`)
    console.log(`cloud:wechatLogin:session_key:${session_key}`)
    res.success(httpResponse.data);
  }, function (httpResponse) {
    res.error(httpResponse)
    console.error(`{"status":"${httpResponse.status}","error":"${httpResponse.error}"}`);
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