var index = window.localStorage.userid;
var object = JSON.parse(window.localStorage.userArr || "{}");  // 使用对象

if (!object[index]) {
    object[index] = {};
}

var selectedRole = 'zhengyi';
var roleData = object[index][selectedRole];

if (!roleData) {
    roleData = {
        achi1: 0,
        achi2: 0,
        achi3: 0,
        achi4: 0,
        achi5: 0,
        achi6: 0,
        achi7: 0,
        achi8: 0
    };
    object[index][selectedRole] = roleData;
}

roleData.achi1 = 1;
object[index][selectedRole] = roleData;

window.localStorage.setItem('userArr', JSON.stringify(object));  // 保存到 localStorage

console.log('Updated object:', object);  // 输出更新后的对象

// 检查是否达成了“全结局”成就
if ([roleData.achi1, roleData.achi2, roleData.achi3, roleData.achi4,roleData.achi5,roleData.achi6,roleData.achi7].every(value => value === 1)) {
    roleData.achi8 = 1;
    roleData.achi8_name = "全结局达成";
    roleData.achi8_desc = "你达成了所有结局！";
    // alert("达成全结局成就");
}