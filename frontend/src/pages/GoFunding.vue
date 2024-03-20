<template>
  <NavHeader />
  <!-- Notification -->
  <transition name="fade">
    <div v-if="showNotification" class="notification flex justify-between">
      <div> Hash copied to clipboard!</div>
      <div @click="showNotification = false" class="text-white cursor-pointer pl-2">&times;</div>
    </div>
  </transition>



  <div class="flex-grow flex justify-center justify-center items-center text-[#F1E9DA]">
    <div class="p-4 rounded rounded-[20px] w-[600px] mx-auto bg-[#541388] tracking-[2px] shadow-2xl">
      <h2 class="text-lg font-bold text-center">Fund Collection Progress</h2>

      <!-- Project Information -->
      <div class="flex justify-between information-block">
        Project HASH:
        <div class="flex">d508b362....e48a7479 &nbsp<img @click="copyToClipboard()" src="../assets/Icons/copy.png" alt=""
            class="h-[20px] cursor-pointer btn-copy invert"></div>
      </div>

      <!-- Time -->
      <div class="flex justify-between information-block">
        Time Left:
        <div v-if="timeLeft > 0">
          {{ timeLeftToFinish.days }} days {{ timeLeftToFinish.hours }}:{{ timeLeftToFinish.minutes }}:{{
            timeLeftToFinish.seconds }}
        </div>
        <div v-else>
          The countdown has ended.
        </div>
      </div>


      <!-- Progress bar -->
      <div class="w-full bg-[#F1E9DA] rounded-lg overflow-hidden">
        <div class="text-black bg-gradient-to-r to-cyan-500 from-[#FFD400] information-block py-1"
          :style="{ width: progress + '%' }">
          <span class="text-sm font-semibold">{{ progress }}%</span>
        </div>
      </div>

      <!-- Amount collected -->
      <div class="information-block flex justify-between">
        <div>
          Collected:
        </div>
        <div>
          {{ amountCollected }} / {{ totalAmount }} ETH
        </div>
      </div>

      <!-- Fund Now -->
      <!-- Check that campaining still going of -->

      <div v-if="timeLeft > 0" @click="FundNow()" class="custom-button-fund">
        Fund Now!</div>
      <div v-else class="custom-button-fund">
        Funding over
      </div>


    </div>

    <!-- <div class="p-[10px]">
      <button @click="increaseFund()" class='text-black bg-green-200 m-2'>Increase</button><br>
      <button @click="decreseFund()" class='text-black bg-red-200 m-2'>Decrease</button>
    </div> -->

  </div>

  <Footer></Footer>
</template>
  
<script>
import Clipboard from 'clipboard';


import NavHeader from '../components/NavHeader.vue';
import Footer from '../components/Footer.vue';

export default {
  components: {
    NavHeader,
    Footer,
  },
  data() {
    return {
      amountCollected: 650, // Initial amount collected
      totalAmount: 1000, // Total amount to be collected
      progress: 0, // Initial progress percentage
      name: '',
      hash: 'd508b36232a5069b4ae932a27aa11e83e48a7479',
      minHash: 'd508b362....e48a7479',
      endtime: 1707555600,
      timeLeft: 0,
      timeLeftToFinish: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      showNotification: false,
    };
  },
  mounted() {
    this.updateTimeLeft();
    // Update time left every second
    this.intervalId = setInterval(this.updateTimeLeft, 1000);
    // Checking the progress
    this.calculateProgress();
  },
  beforeDestroy() {
    // Clear the interval when the component is destroyed
    clearInterval(this.intervalId);
  },
  methods: {
    copyToClipboard() {
      const text = this.hash
      console.log(text)
      const clipboard = new Clipboard('.btn-copy', {
        text: () => text
      })
      this.showCopiedNotification()

    },
    increaseFund() {
      if (this.amountCollected < this.totalAmount && this.amountCollected >= 0) {
        this.amountCollected = this.amountCollected + 10;
        this.calculateProgress()
      } else {
        alert('max Reached')
      }
    },
    decreseFund() {
      if (this.amountCollected > 0) {
        this.amountCollected = this.amountCollected - 10;
        this.calculateProgress()
      } else {
        alert('min')
      }
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
      const currentTime = Math.floor(Date.now() / 1000); // Current UNIX time in seconds
      console.log(currentTime)
      this.timeLeft = this.endtime - currentTime;
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
  