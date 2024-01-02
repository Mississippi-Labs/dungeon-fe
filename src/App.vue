<script setup>
import { map } from './utils/generateMap'
import { ref, onMounted, watch } from 'vue';
import { delay } from './utils/utils'
import Meme from './components/Meme.vue'
import { getUserPublicProfileRequest } from '@web3mq/client';
import { getClient } from './utils/client';

const mapData = ref(null)
const pack = ref([])
const showUpgrade = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)
const isHome = ref(true)
const isBuild = ref(false)
const selectList = ref([true, true, true, true, true])
const hpList = ref([true, true, true, true, true])
const modalContent = ref('')
const clientData = ref(null)
const msgContent = ref('')
const groupId = 'group:80db3d7723e253bff754b83e24c12750714e76c6'
const end = ref({
  hasDoor: false,
  hasKey: false,
})
const monster = ref({
  A: {
    name: 'A',
    hp: 40,
    mp: 20,
    atk: 14,
    def: 12
  },
  B: {
    name: 'B',
    hp: 50,
    mp: 10,
    atk: 12,
    def: 16
  }
})
const player = ref({
  hp: 100,
  max: 100,
  mp: 20,
  atk: 20,
  def: 20,
  x: 0,
  y: 0,
  pack: []
})

const battle = (mon) => {
  let playerHp = player.value.hp
  let playerAtk = player.value.atk
  let playerDef = player.value.def
  let monHp = mon.hp
  let monAtk = mon.atk
  let monDef = mon.def
  let playerCount = 0
  while (playerHp > 0 && monHp > 0) {
    if (playerCount == 0) {
      monHp = monHp - (playerAtk - (monDef * 0.25))
      playerCount = 1
    } else {
      playerHp = playerHp - (monAtk - (playerDef * 0.4))
      playerCount = 0
    }
  }
  player.value.hp = playerHp
  if (playerHp <= 0) {
    home()
    modalContent.value = 'Game over'
    return
  }
}

const open = async (i, j) => {
  if (isLoading.value) {
    return
  }
  isLoading.value = true
  await delay(500)
  isLoading.value = false
  mapData.value[i][j].open = true
  if (player.value.mp > 0) {
    player.value.mp--
  } else {
    player.value.hp -= 5
  }
  let name = mapData.value[i][j].name
  if (name == 'A') {
    // 战斗
    let mon = monster.value.A
    battle(mon)
  } else if (name == 'B') {
    let mon = monster.value.B
    battle(mon)
  } else if (name == '火') {
    // 加火属性
    if (pack.value.findIndex(item => item.name == '火') == -1) {
      pack.value.push({
        name: '火',
        count: 1
      })
    } else {
      pack.value[pack.value.findIndex(item => item.name == '火')].count++
    }
  } else if (name == '宝') {
    // 加宝石
    if (pack.value.findIndex(item => item.name == '宝') == -1) {
      pack.value.push({
        name: '宝',
        count: 1
      })
    } else {
      pack.value[pack.value.findIndex(item => item.name == '宝')].count++
    }
  } else if (name == '铁') {
    // 加铁
    if (pack.value.findIndex(item => item.name == '铁') == -1) {
      pack.value.push({
        name: '铁',
        count: 1
      })
    } else {
      pack.value[pack.value.findIndex(item => item.name == '铁')].count++
    }
  } else if (name == '门') {
    end.value.hasDoor = true
  } else if (name == '钥') {
    end.value.hasKey = true
  }
}

const upgrade = async () => {
  let gem = pack.value.find(item => item.name == '宝')
  let iron = pack.value.find(item => item.name == '铁')
  if (!gem || !iron) {
    modalContent.value = 'Insufficient material'
    return
  }
  if (player.value.pack.length >= 4) {
    modalContent.value = 'Backpack full'
    return
  }
  if (gem.count >= 2 && iron.count >= 2) {
    if (isLoading.value) {
      return
    }
    isLoading.value = true
    await delay(500)
    isLoading.value = false
    player.value.atk += 10
    pack.value[pack.value.findIndex(item => item.name == '宝')].count -= 2
    pack.value[pack.value.findIndex(item => item.name == '铁')].count -= 2
    if (pack.value[pack.value.findIndex(item => item.name == '宝')].count == 0) {
      pack.value.splice(pack.value.findIndex(item => item.name == '宝'), 1)
    }
    if (pack.value[pack.value.findIndex(item => item.name == '铁')].count == 0) {
      pack.value.splice(pack.value.findIndex(item => item.name == '铁'), 1)
    }
    player.value.pack.push({
      name: 'weapon',
      count: 1
    })
  }
}

const recover = async () => {
  let fire = pack.value.find(item => item.name == '火')
  if (!fire) {
    modalContent.value = 'Insufficient material'
    return
  }
  if (fire.count >= 1) {
    if (isLoading.value) {
      return
    }
    isLoading.value = true
    await delay(500)
    isLoading.value = false
    player.value.mp += 10
    if (player.value.mp > 20) {
      player.value.mp = 20
    }
    pack.value[pack.value.findIndex(item => item.name == '火')].count -= 1
    if (pack.value[pack.value.findIndex(item => item.name == '火')].count == 0) {
      pack.value.splice(pack.value.findIndex(item => item.name == '火'), 1)
    }
    showUpgrade.value = false
  }
}

const init = () => {
  let data = map()
  mapData.value = data.map(clos => {
    return clos.map(item => {
      return {
        name: item,
        open: false
      }
    })
  })
  end.value.hasDoor = false
  end.value.hasKey = false
}

const next = async () => {
  if (isLoading.value) {
    return
  }
  isLoading.value = true
  await delay(500)
  isSuccess.value = false
  isLoading.value = false
  init()
}

const start = async () => {
  if (isLoading.value) {
    return
  }
  isLoading.value = true
  await delay(500)
  init()
  isLoading.value = false
  isHome.value = false
}

const home = async () => {
  isHome.value = true
  player.value.mp = 20
  player.value.hp = player.value.max
}

const selectFun = async () => {
  if (isLoading.value) {
    return
  }
  isLoading.value = true
  await delay(500)
  hpList.value = selectList.value.filter(item => item)
  player.value.hp = hpList.value.length * 20
  player.value.max = hpList.value.length * 20
  isLoading.value = false
  isBuild.value = false
}

const sendMsg = async (msg) => {
  console.log(msg)
  try {
    await clientData.value.message.sendMessage(`${+msg + 1}`);
  } catch (error) {
    console.log(error)
  }
}

const showMsg = async (msg) => {
  console.log(msg)
  msgContent.value = msg.content
  setTimeout(() => {
    msgContent.value = ''
  }, 6000)
}

onMounted(() => {
  const getClientFun = async () => {
    console.log('getClientFun')
    try {
      let client = await getClient()
      console.log(client)
      const handleEvent = async (event) => {
        if (event.type === 'channel.getList') {
          const { channelList = [], activeChannel } = client.channel;
          console.log(channelList, activeChannel)
          let channel = channelList.find((item) => item.chatid == groupId)
          if (!channelList || !channelList.length || !channel) {
            await client.channel.joinGroup(groupId);
          }
          client.channel.setActiveChannel(channel)
          clientData.value = client
        }
        if (event.type === 'message.getList') {
          console.log(client.message.messageList, 'message.getList');
          if (client.message.messageList?.length) {
            let lastMsg = client.message.messageList[client.message.messageList.length - 1]
            if (lastMsg) {
              showMsg(lastMsg)
            }
          }
        }
        if (event.type === 'message.delivered') {
          console.log(event)
        }
        if (event.type === 'message.send') {
          let lastMsg = client.message.messageList[client.message.messageList.length - 1]
          showMsg(lastMsg)
        }
      }
      client.on('channel.getList', handleEvent)
      client.on('message.getList', handleEvent);
      client.on('message.delivered', handleEvent);
      client.on('message.send', handleEvent);
      let channelList = await client.channel.queryChannels({
        page: 1,
        size: 100
      })
      let msg = await client.message.getMessageList({
        page: 1,
        size: 1,
      }, groupId);
    } catch (error) {
      console.log(error)
    }
  }
  getClientFun()
})

watch(() => end.value, async (val) => {
  if (val.hasDoor && val.hasKey) {
    await delay(200)
    isSuccess.value = true
  }
}, { deep: true })
</script>

<template>
  <div class="content">
    <div class="player-info">
      <div class="player">
        <img src="./assets/images/player.png" alt="">
        <div class="msg" v-show="msgContent">
          <img src="./assets/images/meme/box.svg" alt="" class="box">
          <img :src="`/src/assets/images/meme/E${msgContent}.svg`" alt="" class="icon">
        </div>
      </div>
      <div class="info">
        <div class="item">
          <div class="key">FIRE</div>
          <div class="value">
            <div class="bar">
              <div class="mp" :style="{ width: (player.mp * 5) + '%' }"></div>
            </div>
            <div class="count">{{ player.mp }}</div>
          </div>
        </div>
        <div class="item">
          <div class="key">HP</div>
          <div class="value">
            <div class="bar">
              <div class="hp" :style="{ width: Math.floor((player.hp / player.max) * 100) + '%' }"></div>
            </div>
            <div class="count">{{ player.hp }}</div>
          </div>
        </div>
        <div class="item">
          <div class="key">ATK</div>
          <div class="value">
            <div class="number">{{ player.atk }}</div>
          </div>
        </div>
        <div class="item">
          <div class="key">DEF</div>
          <div class="value">
            <div class="number">{{ player.def }}</div>
          </div>
        </div>
      </div>
      <div class="player-property">
        <div class="property-item" v-for="item in player.pack" style="border: none;">
          <img src="./assets/images/weapon.png" alt="">
        </div>
        <div class="property-item" v-for="i in (4 - player.pack.length)"></div>
      </div>
    </div>
    <div v-show="!isHome" class="map-info">
      <div class="map-dialog">Player:Go to the next level</div>
      <div class="map">
        <div class="cols" v-for="(item, index) in mapData" :key="index">
          <div class="cols-item" v-for="(e, j) in item" :key="j">
            <div v-if="e.open">
              <img v-if="e.name == 'A'" src="./assets/images/monster0.png" alt="">
              <img v-if="e.name == 'B'" src="./assets/images/monster1.png" alt="">
              <img v-if="e.name == '火'" src="./assets/images/fire.png" alt="">
              <img v-if="e.name == '宝'" src="./assets/images/gem.png" alt="">
              <img v-if="e.name == '铁'" src="./assets/images/iron.png" alt="">
              <img v-if="e.name == '门'" src="./assets/images/door.png" alt="">
              <img v-if="e.name == '钥'" src="./assets/images/key.png" alt="">
            </div>
            <div v-else style="cursor: pointer;" @click="open(index, j)"><img src="./assets/images/wall.png" alt=""></div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="!isHome" class="pack-info">
      <div class="pack-item" v-for="(e, index) in pack" :key="index" style="border: none;">
        <img v-if="e.name == '火'" src="./assets/images/fire.png" alt="" @click="recover">
        <img v-if="e.name == '宝'" src="./assets/images/gem.png" alt="" @click="() => showUpgrade = true">
        <img v-if="e.name == '铁'" src="./assets/images/iron.png" alt="" @click="() => showUpgrade = true">
        <div class="count">{{ e.count }}</div>
      </div>
      <div class="pack-item" v-for="i in (10 - pack.length)"></div>
      <div class="btn" @click="() => showUpgrade = true">synthesis</div>
    </div>
    <div v-show="isHome" class="home">
      <div class="home-hd">
        <img v-for="(item, index) in hpList" :key="index" src="./assets/images/hp.png" alt="">
      </div>
      <div class="home-bd">
        <div class="bd-l">
          <div class="pack-item"></div>
          <div class="pack-item"></div>
          <div class="pack-item"></div>
          <div class="pack-item"></div>
          <div class="pack-item"></div>
          <div class="pack-item"></div>
        </div>
        <div class="bd-r">
          <div class="btn" @click="() => isBuild = true">BUILD</div>
          <div class="btn" @click="start">START</div>
        </div>
      </div>
    </div>
    <div v-show="showUpgrade" class="dialog wrap" @click="() => showUpgrade = false">
      <div class="dialog-content" @click.stop>
        <div class="dao"><img src="./assets/images/weapon.png" alt=""></div>
        <div class="mod">
          <div class="mod-item">
            <img src="./assets/images/gem.png" alt="">
            <div class="count">2</div>
          </div>
          <div class="mod-item">
            <img src="./assets/images/iron.png" alt="">
            <div class="count">2</div>
          </div>
        </div>
        <div class="hint">Increase attack power</div>
        <div class="btn" @click="upgrade">Upgrade</div>
      </div>
    </div>
    <div v-show="isSuccess" class="success wrap">
      <div class="success-content">
        <p>Congratulations on clearing the customs</p>
        <div class="btn">
          <div class="btn-item" @click="home">Home</div>
          <div class="btn-item" @click="next">Next</div>
        </div>
      </div>
    </div>
    <div v-show="isBuild" class="build wrap">
      <div class="build-content">
        <div class="list">
          <img src="./assets/images/img1.png" alt="" @click="() => selectList[0] = !selectList[0]"
            :style="{ border: selectList[0] ? '5px solid #F00' : 'none' }">
          <img src="./assets/images/img2.png" alt="" @click="() => selectList[1] = !selectList[1]"
            :style="{ border: selectList[1] ? '5px solid #F00' : 'none' }">
          <img src="./assets/images/img3.png" alt="" @click="() => selectList[2] = !selectList[2]"
            :style="{ border: selectList[2] ? '5px solid #F00' : 'none' }">
          <img src="./assets/images/img1.png" alt="" @click="() => selectList[3] = !selectList[3]"
            :style="{ border: selectList[3] ? '5px solid #F00' : 'none' }">
          <img src="./assets/images/img2.png" alt="" @click="() => selectList[4] = !selectList[4]"
            :style="{ border: selectList[4] ? '5px solid #F00' : 'none' }">
        </div>
        <div class="btn" @click="selectFun">select</div>
      </div>
    </div>
    <div class="loading wrap" v-show="isLoading">
      <span class="loader"></span>
    </div>
    <div v-show="modalContent" class="modal wrap" @click="() => modalContent = ''">
      <div class="modal-content" @click.stop>
        <p>{{ modalContent }}</p>
        <div class="btn" @click="() => modalContent = ''">Ok</div>
      </div>
    </div>
    <Meme v-if="clientData" @sendMsg="sendMsg" />
  </div>
</template>
