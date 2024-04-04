<template>
    <NavHeader />
    <!-- Notification -->
    <transition name="fade">
        <div v-if="showNotification" class="notification flex justify-between">
            <div> Hash copied to clipboard!</div>
            <div @click="showNotification = false" class="text-white cursor-pointer pl-2">&times;</div>
        </div>
    </transition>

    <div class="flex-grow flex justify-center justify-center items-center">
        <div v-if="!address" class="p-4 rounded rounded-[20px] w-[600px] mx-auto bg-[#541388] tracking-[2px] shadow-2xl space-y-4">
            <h2 class="text-lg font-bold text-center text-[#F1E9DA]">Link project</h2>

            <input type="text" v-model="addressInput" id="projectContractAddrInput" name="projectContractAddrInput" placeholder="Project address"
                class="form-input block w-full" required>
            <div @click="linkContract()" class="custom-button-fund">Go</div>
        </div>

        <div v-if="address" class="p-4 rounded rounded-[20px] w-[600px] mx-auto bg-[#541388] tracking-[2px] shadow-2xl text-[#F1E9DA]">
            <h2 class="text-lg font-bold text-center">Time to vote!</h2>

            <!-- Project Information -->
            <div class="flex justify-between information-block">
                Last commit:
                <div class="flex">
                    {{ minHash }} &nbsp<img @click="copyToClipboard()" src="../assets/Icons/copy.png" alt="" class="h-[20px] cursor-pointer btn-copy invert">
                </div>
            </div>

            <!-- Time -->
            <div class="flex justify-between information-block">
                Voting time:
                <div v-if="timeLeft > 0">
                    {{ timeLeftToFinish.days }} days {{ timeLeftToFinish.hours }}:{{ timeLeftToFinish.minutes }}:{{
                        timeLeftToFinish.seconds }}
                </div>
                <div v-else>
                    The countdown has ended.
                </div>
            </div>


            <div class="flex justify-between w-full bg-[#F1E9DA] rounded-lg overflow-hidden relative">
                <!-- Left bar representing "Yes" -->
                <div class="bg-gradient-to-r from-green-400 to-green-600 information-block py-1"
                    :style="{ width: voteYes + '%' }">
                    <span class="text-sm font-semibold text-gray-700">{{ voteYes }}% Yes</span>
                </div>

                <!-- Right bar representing "No" -->
                <div class="bg-gradient-to-r from-red-600 to-red-400 information-block py-1"
                    :style="{ width: voteNo + '%' }">
                    <span class="text-sm font-semibold float-right "> {{ voteNo }}%  No</span>
                </div>

                <!-- Marker at 70% mark -->
                <div class="absolute top-0 h-full border-l-[3px] border-dashed border-[#000000] text-black "
                    :style="{ left: voteThreshold + '%' }">
                </div>
            </div>





            <!-- Vote -->
            <!-- Check that campaining still going on or not? -->
            <div v-if="timeLeft > 0" class="text-center">
                <!-- If No voting done -->
                <div v-if="!voted" class="mt-3">
                    <!-- Yes -->
                    <div class="information-block text-2xl ">

                        Satisfied? <div>Vote with your <i>{{ voteShare }}%</i>.</div>
                        <!--  -->
                    </div>
                    <div class="flex information-block">
                        <div @click="vote('Yes')" class="custom-button Yes">
                            <div class="flex">
                                Yes
                                <div class="flex flex-col justify-center">
                                    <img src="../assets/Icons/like.png" alt="" class="h-[30px] ml-1 invert">
                                </div>
                            </div>
                        </div>
                        <!-- No -->
                        <div @click="vote('No')" class="custom-button No">
                            <div class="flex">
                                No <div class="flex flex-col justify-center">
                                    <img src="../assets/Icons/dislike.png" alt="" class="h-[30px] ml-1 invert">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Voted already -->
                <div v-else class="mt-3 text-2xl p-1 border-b-[2px] w-max mx-auto">
                    Your vote counted.
                </div>
            </div>
            <!-- If voting time is over -->
            <div v-else class="custom-button-fund">
                Voting Over!
            </div>
        </div>
    </div>

    <Footer></Footer>
</template>
    
<script>
import Clipboard from 'clipboard';

import {
    mapActions,
    mapState
} from 'pinia'

import { useContract } from '../stores/contract/contract';

import NavHeader from '../components/NavHeader.vue';
import Footer from '../components/Footer.vue';

export default {
    components: {
        NavHeader,
        Footer,
    },
    data() {
        return {
            totalVote: 100,
            timeLeft: 0,
            timeLeftToFinish: {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            },
            showNotification: false
        };
    },
    computed: {
        ...mapState(useContract, ['address', 'hash', 'minHash', 'name', 'voteShare', 'voteNo', 'voteYes', 'voteThreshold', 'voteEndtime', 'voted', 'voteActive'])
    },
    mounted() {
        this.refresh()
    },
    beforeDestroy() {
        // Clear the interval when the component is destroyed
        clearInterval(this.intervalId);
    },
    methods: {
        async linkContract() {
            try {
                const address = this.addressInput
                console.log("linking contract")

                const contract = useContract()
                await contract.load(address)
                await contract.persistAddress(address)

                this.refresh()

                console.log(contract.$state)
            } catch (e) {
                alert(e)
            }
        },
        refresh() {
            this.updateTimeLeft();
            // Update time left every second
            this.intervalId = setInterval(this.updateTimeLeft, 1000);
            // Checking the progress
            this.calculateProgress();
        },
        copyToClipboard() {
            const text = this.hash
            console.log(text)
            const clipboard = new Clipboard('.btn-copy', {
                text: () => text
            })
            this.showCopiedNotification()

        },
        async vote(vote) {
            const contract = useContract()
            await contract.vote(vote)
        },
        calculateProgress() {
            this.progress = (this.amountCollected / this.totalAmount) * 100;
        },
        showCopiedNotification() {
            this.showNotification = true;
            setTimeout(() => {
                this.showNotification = false;
            }, 2000); // Adjust the duration as needed (in milliseconds)
        },
        updateTimeLeft() {
            const contract = useContract()

            const currentTime = Math.floor(Date.now() / 1000); // Current UNIX time in seconds
            console.log(currentTime)
            this.timeLeft = contract.voteEndtime - currentTime;
            console.log(this.timeLeft)
            if (this.timeLeft > 0) {
                this.timeLeftToFinish.days = Math.floor(this.timeLeft / (60 * 60 * 24));
                this.timeLeftToFinish.hours = Math.floor((this.timeLeft % (60 * 60 * 24)) / (60 * 60));
                this.timeLeftToFinish.minutes = Math.floor((this.timeLeft % (60 * 60)) / 60);
                this.timeLeftToFinish.seconds = this.timeLeft % 60;
            } else {
                // Stop the countdown if the target time has passed
                clearInterval(this.intervalId);
            }
        }
    },
};
</script>
    
<style scoped>
/* Add scoped styles if needed */
* {
    /* border: 1px solid; */
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #541388;
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    z-index: 999;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active below version 2.1.8 */
    {
    opacity: 0;
}

.information-block {
    padding: 5px 10px 5px 10px;
}

.custom-button {
    margin-top: 5px;
    margin-left: auto;
    margin-right: auto;
    height: 50px;
    width: 250px;
    border-radius: 17px;
    display: grid;
    place-content: center;
    cursor: pointer;
    font-size: 1.3rem;
    /* Adjust as per your design */
    letter-spacing: 1.5px;

}

.Yes {
    background-color: #006400;
}

.Yes:hover {
    background-color: #009400;
}

.No {
    background-color: #a00000;
}

.No:hover {
    background-color: #ff0000;
}

.custom-button-fund {
  color: black;
  margin-top: 5px;
  margin-left: auto;
  margin-right: auto;
  height: 50px;
  width: 300px;
  background-color: #FFD400;
  border-radius: 17px;
  display: grid;
  place-content: center;
  cursor: pointer;
  font-size: 1.3rem;
  /* Adjust as per your design */
  letter-spacing: 1.5px;
}

.custom-button-fund:hover {
  background-color: #bea006;
}

</style>
    