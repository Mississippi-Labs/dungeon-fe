<script setup>
import { ref, defineEmits } from 'vue'

const emits = defineEmits(['sendMsg'])

const isShowAll = ref(false);
const arr = ref(new Array(10).fill(0));
const changeShow = () => {
  if (isShowAll) {
    arr.value = new Array(10).fill(0);
  } else {
    arr.value = new Array(50).fill(0);
  }
  isShowAll.value = !isShowAll.value;
}
const sendMsg = (index) => {
  const msg = `${index}`;
  emits('sendMsg', msg)
}
</script>

<template>
  <div className='meme' :style="{ maxHeight: isShowAll ? '210px' : '70px' }">
    <div className='bg' :style="{ height: isShowAll ? 'auto' : '30px' }">
      <img src="../assets/images/meme/meme.svg" alt="" />
      <div className="btns">
        <div v-for="(item, index) in arr" :key="index" className='meme-item' @click="sendMsg(index)"></div>
      </div>
    </div>
    <div className='show-all' :style="{ transform: isShowAll ? 'rotate(0deg)' : 'rotate(180deg)' }" @click="changeShow">
      <img src='../assets/images/meme/arrow.svg' alt='' />
    </div>
  </div>
</template>

<style scoped lang="scss">
.meme {
  position: fixed;
  left: 0;
  right: 0;
  margin: auto;
  bottom: 50px;
  width: 420px;
  border-radius: 10px;
  border: 10px solid #BC8C61;
  background: #FCBD80;
  padding: 10px 40px 10px 10px;
  box-sizing: border-box;
  max-height: 70px;
  transition: all 0.3s inherit;
  font-size: 0;
  overflow: hidden;

  .bg {
    width: 345px;
    height: auto;
    overflow: hidden;
    position: relative;

    img {
      width: 100%;
      height: auto;
    }

    .btns {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }

  .meme-item {
    position: relative;
    z-index: 2;
    cursor: pointer;
    width: 30px;
    height: 30px;
    margin-right: 2px;
    margin-bottom: 5px;
  }

  .show-all {
    position: absolute;
    right: 10px;
    top: 15px;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: #BC8C61;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s inherit;

    img {
      width: 15px;
      height: 15px;
    }
  }

}
</style>
