<template>
    <div class="history">
        <mu-paper class="park-item" v-for="item in parkList" :key="item.startTime">
            <mu-timeline>
                <mu-timeline-item>
                    <span slot="time">{{new Date(item.startTime).toLocaleDateString()+new Date(item.startTime).toLocaleTimeString()}}</span>
                    <span slot="des">停车</span>
                </mu-timeline-item>
                <mu-timeline-item>
                    <span slot="time">{{new Date(item.endTime).toLocaleDateString()+new Date(item.endTime).toLocaleTimeString()}}</span>
                    <span slot="des">开走</span>
                </mu-timeline-item>

                <mu-timeline-item>
                    <span>花费{{item.cost}}元</span>
                </mu-timeline-item>
            </mu-timeline>
        </mu-paper>
        <p style="text-align: center">没有更多了</p>
    </div>
</template>

<script>
    import Vue from 'vue'
    import ParkTabCanvas from '@/components/ParkHistoryTab'
    export default {
        name: "park-history",
        created() {
            this.parkList = JSON.parse(Vue.localStorage.get('parkList', '[]')).reverse()
            var t = [1]
        },
        components:{

        },
        data() {
            return {
                parkList: []
            }
        }
    }
</script>

<style scoped>
    .history {
        height: 100%;
        overflow-y: auto;
    }

    .park-item {
        padding: 20px;
        margin: 10px 0;
    }
</style>