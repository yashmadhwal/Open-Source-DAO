<template>
  <!-- Navigation Header -->
  <NavHeader />

  <!-- Project Proposal Form -->
  <div class="p-[10px] h-max flex-grow justify-center flex justify-center items-center ">
    <div class="border-[2px] p-3 w-[700px] bg-[#541388] rounded rounded-[20px] shadow-2xl">
      <h1 class="text-4xl font-bold mb-4 text-center text-[#F1E9DA]">Project Proposal Form</h1>

      <input type="text" v-model="proposalHash" id="proposalHash" name="proposalHash" placeholder="Document hash"
        class="form-input block w-full" required>

      <div class="flex">
        <input type="number" v-model="duration" id="duration" name="duration" placeholder="Duration (Months)"
          class="form-input block w-full" min="1" required>

        <input type="number" v-model="monthlyAllowance" id="monthlyAllowance" name="monthlyAllowance"
          placeholder="Team Monthly Allowance" min="1" class="form-input block w-full" required>
      </div>

      
      <input type="text" v-model="developerAddresses" id="developerAddresses" name="developerAddresses"
        placeholder="Addresses separated by commas" class="form-input block w-full" required>
      

        <div>
      <input type="number" v-model="multisigThreshold" id="multisigThreshold" name="multisigThreshold"
        placeholder="Multisig signature threshold" min="1" class="form-input block w-full" required>
      </div>

      <input type="text" v-model="fundsCollectionTimeframe" id="fundsCollectionTimeframe" name="fundsCollectionTimeframe"
        placeholder="ICO duration" class="form-input block w-full" required>
      <div class="flex mx-auto">
        
        <input type="number" v-model="consensusTimeframe" id="consensusTimeframe" name="consensusTimeframe"
          placeholder="Days for monthly consensus" min="1" class="form-input block w-full" required>
        

        
        <input type="number" v-model="sponsorVoteQuorum" id="sponsorVoteQuorum" name="sponsorVoteQuorum"
          placeholder="Sponsor monthly vote quorum" min="1" class="form-input block w-full" required>

      </div>

      <div class="flex">
        <input type="number" v-model="utilityTokenSupply" id="utilityTokenSupply" name="utilityTokenSupply"
          placeholder="Total utility token supply" min="1" class="form-input block w-full" required>

        <input type="number" v-model="reportThreshold" id="reportThreshold" name="reportThreshold"
          placeholder="Threshold for monthly report signatures" min="1" class="form-input block w-full" required>
      </div>
      <div class="mt-4 flex justify-center text-center">
        <button type="submit" class="submit-button">
          Submit
        </button>
      </div>
    </div>
  </div>

  <Footer></Footer>
</template>

<script>
import NavHeader from '../components/NavHeader.vue';
import Footer from '../components/Footer.vue';

export default {
  name: 'LaunchProject',
  components: {
    NavHeader,
    Footer
  }
}
</script>

<style>
.form-input {
  border: 1.5px solid #675F3E;
  border-radius: 10px;
  height: 40px;
  text-align: center;
  margin-top: 5px;
}

.form-input:hover {
  border: 1.5px solid #FFD400;
}

.submit-button {
  height: 50px;
  width: 125px;
  background-color: #FFD400;
  border-radius: 10px;
  display: grid;
  place-content: center;
  cursor: pointer;
  font-size: 20px;
  letter-spacing: 1px;
}

.submit-button:hover {
  background-color: #bea006;
}
</style>

