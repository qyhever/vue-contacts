<template>
  <scroll class="listview"
    ref="listview"
    :listen-scroll="true"
    :probe-type="3"
    :data="data"
    @scroll="handleScroll">
    <!-- left list -->
    <ul>
      <li class="list-group"
        v-for="(group, index) in data"
        :key="index"
        ref="listGroup">
        <h2 class="list-group-title border-topbottom">{{group.title}}</h2>
        <ul>
          <li class="list-group-item"
            v-for="(item, i) in group.items"
            :key="i">
            <img class="avatar" :src="item.avatar" alt="">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- right alphabet -->
    <div class="list-shortcut"
      ref="listShortcut"
      @touchstart="handleShortcutTouchStart"
      @touchmove="handleShortcutTouchMove"
      @touchend="handleShortcutTouchEnd">
      <ul>
        <li class="item"
          v-for="(item, index) in shortcutList"
          :key="index"
          :data-index="index"
          :class="{'current': currentIndex === index}">
          {{item}}
        </li>
      </ul>
    </div>

    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <p class="fixed-title border-bottom">{{fixedTitle}}</p>
    </div>
  </scroll>
</template>

<script>
import Scroll from '@/base-components/scroll/scroll'
import data from '../mock/singer.json'
const TITLE_HEIGHT = 30
const ANCHOR_HEIGHT = 18

export default {
  components: {
    Scroll
  },
  data () {
    return {
      data: data,
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  watch: {
    data() {
      this.$nextTick(() => {
        this._calcGroupHeight()
      })
    },
    scrollY(newY) {
      const heightList = this.heightList
      // 当滚动到最顶部，newY > 0（对应操作：在最顶部向下拉）
      if (newY > 0) {
        newY = 0
        this.currentIndex = 0
        return
      }
      // 在中间部分滚动，正常情况
      for (let i = 0; i < heightList.length - 1; i++) {
        let heightTop = heightList[i]
        let heightBottom = heightList[i + 1]
        if (-newY >= heightTop && -newY < heightBottom) {
          this.currentIndex = i
          this.diff = heightBottom + newY
          return
        }
      }
      // 当滚动到底部，且-newY 大于最后一个元素的上限
      this.currentIndex = heightList.length - 2
    },
    diff(newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  computed: {
    shortcutList() {
      return this.data.map(group => {
        return group.title.slice(0, 1)
      })
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  created() {
    console.log(this.data)
    this.touch = {}
    this.heightList = []
  },
  mounted() {
    this.$nextTick(() => {
      this._calcGroupHeight()
    })
  },
  methods: {
    handleShortcutTouchStart(e) {
      this.$refs.listShortcut.style.backgroundColor = 'rgba(0, 0, 0, .4)'
      const anchorIndex = +e.target.dataset['index'] // 获取到的是字符串
      this.touch.y1 = e.touches[0].pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    handleShortcutTouchMove(e) {
      this.touch.y2 = e.touches[0].pageY
      let deltaIndex = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT
      deltaIndex = Math.floor(deltaIndex)
      const anchorIndex = this.touch.anchorIndex + deltaIndex
      this._scrollTo(anchorIndex)
    },
    handleShortcutTouchEnd(e) {
      this.$refs.listShortcut.style.backgroundColor = 'rgba(0, 0, 0, .3)'
    },
    handleScroll(pos) {
      this.scrollY = pos.y
    },
    _calcGroupHeight() {
      this.heightList = []
      const listEl = this.$refs.listGroup
      let height = 0
      this.heightList.push(height)
      for (let i = 0; i < listEl.length; i++) {
        let item = listEl[i]
        height += item.clientHeight
        this.heightList.push(height)
      }
    },
    _scrollTo(index) {
      // 点击上下多余部分
      if (Object.is(index, null) || Object.is(index, NaN)) {
        return
      }
      // 边界情况
      if (index < 0) {
        index = 0
      }
      if (index > this.heightList.length - 2) {
        index = this.heightList.length - 2
      }
      this.scrollY = -this.heightList[index]
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    }
  }
}
</script>

<style scoped lang="stylus">
  .border-topbottom:before,
  .border-topbottom:after,
  .border-bottom:before,
  .border-bottom:after
    border-color: #ccc 

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    // background-color: #222
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        padding-left: 20px
        // background-color: #333
        background-color: #eee
        line-height: 30px
        // color: hsla(0,0%,100%,.5)
        font-size: 12px
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          // color: hsla(0,0%,100%,.5)
          font-size: 14px
    .list-shortcut
      z-index: 1
      position: absolute
      top: 50%
      right: 0
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background-color: rgba(0, 0, 0, .3)
      & .item
        padding: 3px
        line-height: 1
        color: hsla(0,0%,100%,.5)
        font-size: 12px
        &.current
          color: #ffcd32
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        // background-color: #333
        background-color: #eee
        font-size: 12px
        // color: hsla(0,0%,100%,.5)
</style>