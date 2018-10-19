const APPID = 'wxc14d0ff891dbbb64';
const SECRET = '654f6c6559336fa79d13c85e4cb2e080';

/**
 * 把数据清空
 * 1、清空game表
 * 2、清空pattern表
 * 3、清空用户表
 * 4、清空role表
 * 5、清空session
 * 6、清空publicGame表
 * 7、清空publicPattern表
 */
Parse.Cloud.define('clear', function (req) {
  //1、清空game表
  var Game = Parse.Object.extend("Game");
  let query = new Parse.Query(Game);
  return query.find(null, { useMasterKey: true }).then(function (games) {
    console.log(`cloud:clear:1、清空game表`);
    return Parse.Object.destroyAll(games, { useMasterKey: true });
  }).then(function (games) {
    //2、清空pattern表
    var Pattern = Parse.Object.extend("Pattern");
    let query = new Parse.Query(Pattern);
    return query.find(null, { useMasterKey: true });
  }).then(function (patterns) {
    console.log(`cloud:clear:2、清空pattern表`);
    return Parse.Object.destroyAll(patterns, { useMasterKey: true });
  }).then(function (patterns) {
    //3、清空用户表
    let query = new Parse.Query(Parse.User);
    return query.find(null, { useMasterKey: true });
  }).then(function (users) {
    console.log(`cloud:clear:3、清空用户表`);
    return Parse.Object.destroyAll(users, { useMasterKey: true });
  }).then(function (users) {
    //4、清空role表
    let query = new Parse.Query(Parse.Role);
    return query.find(null, { useMasterKey: true });
  }).then(function (roles) {
    console.log(`cloud:clear:4、清空role表`);
    return Parse.Object.destroyAll(roles, { useMasterKey: true });
  }).then(function (users) {
    //5、清空session
    let query = new Parse.Query(Parse.Session);
    return query.find(null, { useMasterKey: true });
  }).then(function (sessions) {
    console.log(`cloud:clear:5、清空session`);
    return Parse.Object.destroyAll(sessions, { useMasterKey: true });
  }).then(function (sessions) {
    //6、清空PublicGame表
    var PublicGame = Parse.Object.extend("PublicGame");
    let query = new Parse.Query(PublicGame);
    return query.find(null, { useMasterKey: true });
  }).then(function (pgs) {
    console.log(`cloud:clear:6、清空PublicGame表`);
    return Parse.Object.destroyAll(pgs, { useMasterKey: true });
  }).then(function (pgs) {
    //6、清空PublicGame表
    var PublicPattern = Parse.Object.extend("PublicPattern");
    let query = new Parse.Query(PublicPattern);
    return query.find(null, { useMasterKey: true });
  }).then(function (pps) {
    console.log(`cloud:clear:7、清空PublicPattern表`);
    return Parse.Object.destroyAll(pps, { useMasterKey: true });
  }).then(function (pps) {
    return { code: 200, msg: 'ok' };
  }).catch(function (error) {
    return { code: error.code, msg: error.message };
  });
})

/**
 * 系统初始化
 * 0、判断用户screenuser是否存在，存在说明已经初始化，不用再初始化
 * 1、新建screenuser用户 
 * 2、新建screen角色 并把其加入到screen角色的users中
 * 3、新建公共盲注模板
 * 4、新建公共比赛,会使用刚刚新建的公共盲注模板
 */
Parse.Cloud.define('init', function (req) {
  //0、判断用户screenuser是否存在，存在说明已经初始化，不用再初始化
  let query = new Parse.Query(Parse.User);
  query.equalTo('username', 'screenuser');
  return query.first(null, { useMasterKey: true }).then(function (user) {
    if (user) {
      throw new Parse.Error(1004, `系统初始化已完成，不需要初始化。`);
    } else {
      //1、新建screenuser用户
      var user = new Parse.User();
      user.set("username", 'screenuser');
      user.set("password", '1');
      console.log(`cloud:init:1:新建screenuser:`);
      return user.signUp(null);
    }
  }).then(function (user) {
    //2、新建screen角色 并把其加入到screen角色的users中
    var roleACL = new Parse.ACL();
    roleACL.setPublicReadAccess(true);
    roleACL.setPublicWriteAccess(false);
    var role = new Parse.Role('screen', roleACL);
    role.getUsers().add(user);
    console.log(`cloud:init:2、新建screen角色 并把其加入到screen角色的users中`);
    return role.save(null, { useMasterKey: true });
    // return role.save();
  }).then(function (role) {
    //3、新建公共盲注模板
    let Pattern = Parse.Object.extend("PublicPattern");
    let pattern = new Pattern();
    let rounds = [];
    for (let i = 0; i < 12; i++) {
      let level = i + 1;
      let round = { level, ante: 5, smallBlind: 10 * i, bigBlind: 20 * i, duration: 10 };
      if (i % 4 == 0) {
        round.breakDuration = 10;
      }
      rounds.push(round);
    }
    pattern.set('title', '盲注模板(12级别10分钟)');
    pattern.set('rounds', rounds);
    //设置Acl
    let patternAcl = new Parse.ACL();
    patternAcl.setPublicReadAccess(true);
    patternAcl.setPublicWriteAccess(false);
    pattern.set('ACL', patternAcl);
    console.log(`cloud:init:3、新建公共盲注模板`);
    return pattern.save(null, { useMasterKey: true });
  }).then(function (pattern) {
    //4、新建公共比赛,会使用刚刚新建的公共盲注模板
    let Game = Parse.Object.extend("PublicGame");
    let game = new Game();
    game.set('title', '比赛模板');
    game.set('subTitle', '盲注:12级别10分钟');
    game.set('startChips', 1000);
    game.set('startTime', new Date());
    game.set('rebuy', true);
    game.set('rebuyChips', 1000);
    game.set('addon', true);
    game.set('addonChips', 1000);
    game.set('players', 100);
    game.set('restPlayers', 100);
    game.set('rewardPlayers', 10);
    game.set('rounds', pattern.get('rounds'));
    //设置Acl
    let gameAcl = new Parse.ACL();
    gameAcl.setPublicReadAccess(true);
    gameAcl.setPublicWriteAccess(false);
    game.set('ACL', gameAcl);
    console.log(`cloud:init:4、新建公共比赛,会使用刚刚新建的公共盲注模板`);
    return game.save(null, { useMasterKey: true })
  }).then(function (game) {
    return { code: 200, msg: 'ok' };
  }).catch(function (error) {
    return { code: error.code, msg: error.message };
  });
})


/**
 * 取消他们分享的权限
 * 1、获取user
 * 2、获取user的curRole和ownRole
 * 3、curRole的users删除user 。
 * 4、把user加入ownRole的users中
 * 5、把user的curRole改成ownRole
 */
Parse.Cloud.define('cancelShareRole', function (req) {
  let userId = req.params.userId;//提供角色的用户
  let user;
  let curRole;
  let ownRole;
  //获取user
  let query = new Parse.Query(Parse.User);
  query.include('curRole');
  query.include('ownRole');
  console.log(`cloud:cancelShareRole:1、获取user`)
  return query.get(userId).then(function (user1) {
    user = user1;
    // 2、获取user的curRole为curRole
    // 3、获取user的ownRole为ownRole
    console.log(`cloud:cancelShareRole:2、获取user的curRole和ownRole`)
    curRole = user.get('curRole');
    ownRole = user.get('ownRole');

    //4、curRole的users删除user 。
    curRole.getUsers().remove(user);
    console.log(`cloud:cancelShareRole:3、curRole的users删除user 。`)
    return curRole.save(null, { useMasterKey: true });
  }).then(function (curRole) {
    console.log(`cloud:cancelShareRole:3.1`)
    // 5、把user加入ownRole的users中
    ownRole.getUsers().add(user);
    console.log(`cloud:cancelShareRole:4、把user加入ownRole的users中`)
    return ownRole.save(null, { useMasterKey: true });
  }).then(function (ownRole) {
    //6、把user的curRole改成ownRole
    console.log(`cloud:cancelShareRole:5、把user的curRole改成ownRole`)
    user.set('curRole', ownRole);
    return user.save(null, { useMasterKey: true });
  }).catch(function (error) {
    console.log(`cloud:shareRoleToOtherUser:error:${error}`)
    throw error;
  });
})


/**
 * 分享权限给他人
 * 1、获取sourceUser和targetUser
 * 2、获取sourceUser的ownRole为sourceOwnRole
 * 3、获取targetUser的ownRole为targetOwnRole
 * 4、把targetUser加入sourceOwnRole的users中
 * 5、targetOwnRole的users删除targetUser  user只能存在一个role的users中。
 * 6、把targetUser的curRole改成sourceOwnRole
 */
Parse.Cloud.define('shareRoleToOtherUser', (req) => {
  let sourceUserId = req.params.sourceUserId;//提供角色的用户
  let targetUserId = req.params.targetUserId;//获取到其实用户提供的权限的用
  let sourceUser, targetUser;
  let sourceOwnRole, targetOwnRole;
  console.log(`cloud:shareRoleToOtherUser:1:获取sourceUser`)
  //1、获取sourceUser和targetUser
  let query = new Parse.Query(Parse.User);
  query.include('ownRole');
  return query.get(sourceUserId).then(function (user) {
    if (!user) {
      throw new Parse.Error(1001, `源用户[${user.id}]不存在`);
    } else {
      sourceUser = user;
      //2、获取sourceUser的ownRole为sourceOwnRole
      sourceOwnRole = user.get('ownRole');
      return query.get(targetUserId);
    }
  }).then(function (user) {
    if (!user) {
      throw new Parse.Error(1002, `目标用户[${user.id}]不存在`);
    } else {
      targetUser = user;
      //3、获取targetUser的ownRole为targetOwnRole
      targetOwnRole = user.get('ownRole');
      //判断是否已经共享权限给目标用户了。
      let relactionUsers = sourceOwnRole.getUsers();
      let queryUsers = relactionUsers.query();
      queryUsers.equalTo('objectId', targetUserId);
      return queryUsers.first();
    }
  }).then(function (userFound) {
    //如果用户存在
    if (userFound) {
      //直接报错
      throw new Parse.Error(1003, `用户[${userFound.id}]已经共享了你的权限。不用重复添加。`);
    } else {
      // 4、把targetUser加入sourceOwnRole的users中
      sourceOwnRole.getUsers().add(targetUser);
      console.log(`cloud:shareRoleToOtherUser:4、把targetUser加入sourceOwnRole的users中`)
      return sourceOwnRole.save(null, { useMasterKey: true })
    }
  }).then(function (role) {
    //5、targetOwnRole的users删除targetUser  user只能存在一个role的users中。
    console.log(`cloud:shareRoleToOtherUser:5、targetOwnRole的users删除targetUser`)
    targetOwnRole.getUsers().remove(targetUser);
    return targetOwnRole.save(null, { useMasterKey: true });
  }).then(function (role) {
    console.log(`cloud:shareRoleToOtherUser:6、把targetUser的curRole改成sourceOwnRole`)
    targetUser.set('curRole', sourceOwnRole);
    return targetUser.save(null, { useMasterKey: true });
  }).then(function (user) {
    return { code: 200, msg: 'ok' };
  }).catch(function (error) {
    console.log(`cloud:shareRoleToOtherUser:error:${error}`)
    return { code: error.code, msg: error.message };
  });
})

/**
 * 只能在3.0以上版本才能没有response
 * 1、获取openid
 * 2、判断用户是否存在 存在则登录 不存在注册
 */
Parse.Cloud.define('weappAuthOnlyCode', (req) => {
  console.log(`cloud:weappauth:code:${req.params.code}`)
  var openid;
  //获取openId
  return Parse.Cloud.httpRequest({
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
      return dealSignUp(openid);
    }
  }).catch(function (error) {
    console.log(`cloud:weappAuthOnlyCode:error:${error}`)
    throw error;
  });
});

/**
 * 复制公共比赛的promise
 * @param {*} role 
 */
function copyPublicGames(role) {
  //4、复制公共比赛
  let PublicGame = Parse.Object.extend("PublicGame");
  let query = new Parse.Query(PublicGame);
  query.find().then(function (pgames) {
    console.log(`cloud:weappAuthOnlyCode:pgames:${pgames.length}`);
    let games = [];
    for (pgame of pgames) {
      let Game = Parse.Object.extend("Game");
      let game = new Game();
      game.set('title', pgame.get('title'));
      game.set('subTitle', pgame.get('subTitle'));
      game.set('startChips', pgame.get('startChips'));
      game.set('startTime', pgame.get('startTime'));

      let rebuy = pgame.get('rebuy');
      game.set('rebuy', rebuy);
      if (rebuy)
        game.set('rebuyChips', pgame.get('rebuyChips'));
      let addon = pgame.get('addon');
      game.set('addon', addon);
      if (addon)
        game.set('addonChips', pgame.get('addonChips'));

      game.set('players', pgame.get('players'));
      game.set('restPlayers', pgame.get('restPlayers'));
      game.set('rewardPlayers', pgame.get('rewardPlayers'));

      game.set('rounds', pgame.get('rounds'));
      //设置Acl
      let gameAcl = new Parse.ACL();
      gameAcl.setPublicReadAccess(false);
      gameAcl.setPublicWriteAccess(false);
      //role 应该是user的ownRole,注册时一样的 所以直接使用
      gameAcl.setRoleReadAccess(role, true);
      gameAcl.setRoleWriteAccess(role, true);
      game.set('ACL', gameAcl);
      games.push(game);
    }
    return Parse.Object.saveAll(games);
  });
}
/**
 * 复制公共模板Promise
 * @param {*} role 
 */
function copyPublicPatterns(role) {
  //复制公共模板
  let PublicPattern = Parse.Object.extend("PublicPattern");
  query = new Parse.Query(PublicPattern);
  query.descending('_created_at');
  query.find().then(function (ppatterns) {
    console.log(`cloud:weappAuthOnlyCode:ppatterns:${ppatterns.length}`);
    let patterns = [];
    for (ppattern of ppatterns) {
      let Pattern = Parse.Object.extend("Pattern");
      let pattern = new Pattern();
      pattern.set('title', ppattern.get('title'));
      pattern.set('rounds', ppattern.get('rounds'));
      //设置Acl
      let patternAcl = new Parse.ACL();
      patternAcl.setPublicReadAccess(false);
      patternAcl.setPublicWriteAccess(false);
      //role 应该是user的ownRole,注册时一样的 所以直接使用
      patternAcl.setRoleReadAccess(role, true);
      patternAcl.setRoleWriteAccess(role, true);
      pattern.set('ACL', patternAcl);
      patterns.push(pattern);
    }
    return Parse.Object.saveAll(patterns);
  });
}

/**
 * 处理注册
 * 如果是注册 新建一个属于这个用户的角色  用于共享
 * 0、注册用户
 * 1、新建role
 * 2、把user加入这个role的users属性中
 * 3、user中新一个属性ownrole指向这个role
 * 4、复制公共比赛
 * 5、复制公共盲注模板
 * @param {*} openid 
 */
function dealSignUp(openid) {
  let signupUser;
  let userCurRole;

  //0、注册用户
  var user = new Parse.User();
  user.set("username", openid);
  user.set("password", openid);
  console.log(`cloud:weappAuthOnlyCode:1:注册用户:`);
  return user.signUp(null).then(function (user) {
    //新建访问权限
    var roleACL = new Parse.ACL();
    roleACL.setPublicReadAccess(true);//大家都可以读 
    roleACL.setWriteAccess(user.id, true);//只有注册用户可以读
    //1、新建role
    var role = new Parse.Role(user.id, roleACL);
    //2、把user加入这个role的users属性中
    role.getUsers().add(user);
    console.log(`cloud:weappAuthOnlyCode:2、把user加入这个role的users属性中:`);
    return role.save();
  }).then(function (role) {
    userCurRole = role;
    // console.log(`cloud:weappAuthOnlyCode:roleSave:before:${role.get('name')}`);
    //3、user中新一个属性ownrole、curRole指向这个role
    user.set('ownRole', role);
    user.set('curRole', role);
    //正常情况下，已经验证过的user是可以正常save的，
    //但不行，只能使用{ useMasterKey: true }更新user对象
    console.log(`cloud:weappAuthOnlyCode:3、user中新一个属性ownrole指向这个role`);
    return user.save(null, { useMasterKey: true });
  }).then(function (user) {
    signupUser = user;
    // console.log(`cloud:weappAuthOnlyCode:userHasRole.save:${userHasRole.get('username')}`);
    //4、复制公共比赛
    console.log(`cloud:weappAuthOnlyCode:4、复制公共比赛`);
    return copyPublicGames(userCurRole);
  }).then(function (pGames) {
    // console.log(`cloud:weappAuthOnlyCode:user.pGames:length:${pGames.length}`);
    console.log(`cloud:weappAuthOnlyCode:5、复制公共盲注模板`);
    return copyPublicPatterns(userCurRole);
  }).then(function (pPatterns) {
    //5、复制公共盲注模板
    console.log(`cloud:weappAuthOnlyCode:完成`);
    return signupUser;
  });
}


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


/**
 * 新建device对象是生成四位的UUID 
 * 不够位自动补0 如0001
 */
Parse.Cloud.beforeSave("Device", function (request) {
  const query = new Parse.Query("Device");
  return query.count()
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
        return device.set('uuid', uuid);
      }
    })
});
