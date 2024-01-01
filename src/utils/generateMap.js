function generateMap(config, monsters) {
  const rows = 5;
  const cols = 6;
  const map = [];

  // 初始化地图
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(generateElement(config, monsters));
    }
    map.push(row);
  }

  // 随机放置一把钥匙和一扇门
  placeSpecialItem(map, rows, cols, '钥');
  placeSpecialItem(map, rows, cols, '门');

  return map;
}

function generateElement(config, monsters) {
  const totalProbability = Object.values(config).reduce((sum, value) => sum + value, 0);
  const rand = Math.random() * totalProbability;
  let cumulativeProbability = 0;

  for (const element in config) {
    cumulativeProbability += config[element];
    if (rand < cumulativeProbability) {
      return element === '怪' ? '' + monsters[Math.floor(Math.random() * monsters.length)] : element;
    }
  }

  return '  '; // 如果所有条件都不满足，则返回空白格子
}


function placeSpecialItem(map, rows, cols, item) {
  let availableSpaces = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (map[i][j].trim() === '') {
        availableSpaces.push([i, j]);
      }
    }
  }

  if (availableSpaces.length > 0) {
    const [randRow, randCol] = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
    map[randRow][randCol] = item;
  } else {
    console.error("无法放置特殊物品：" + item);
  }
}

// 配置对象：定义每种元素的出现概率
const config = {
  '怪': 1,  // 怪物的相对概率
  '铁': 1,  // 铁块的相对概率
  '宝': 1,  // 宝石的相对概率
  '火': 1,  // 火把的相对概率
  ' ': 1.2,  // 空白的相对概率
};

const monsters = ['A', 'B']; // 怪物列表，每个怪物有一个ID



function printMap(map) {
  const horizontalBorder = '+' + '-'.repeat(5 * map[0].length) + '+';
  console.log(horizontalBorder);

  for (const row of map) {
    console.log('| ' + row.join(' | ') + ' |');
    console.log(horizontalBorder);
  }
}


export const map = () => {
  const myMap = generateMap(config, monsters);
  return myMap;
}