(function () {
var index = window.localStorage.userid;
var object;
try { object = JSON.parse(window.localStorage.userArr || "[]"); }
catch (error) { return; }
if (!object || typeof object !== 'object' || index === undefined || index === null
    || !Object.prototype.hasOwnProperty.call(object, index) || !object[index]
    || typeof object[index] !== 'object') return;

var selectedRole = 'linwanxing';
var roleData = object[index][selectedRole];

if (!roleData) {
    roleData = {
        achi1: 0,
        achi2: 0,
        achi3: 0,
        achi4: 0,
        achi5: 0
    };
    object[index][selectedRole] = roleData;
}

roleData.achi1 = 1;
object[index][selectedRole] = roleData;

// 检查是否达成了“全结局”成就
if ([roleData.achi1, roleData.achi2, roleData.achi3, roleData.achi4].every(value => value === 1)) {
    roleData.achi5 = 1;
    roleData.achi5_name = "全结局达成";
    roleData.achi5_desc = "你达成了所有结局！";
    // alert("达成全结局成就");
}

window.localStorage.setItem('userArr', JSON.stringify(object));
})();
