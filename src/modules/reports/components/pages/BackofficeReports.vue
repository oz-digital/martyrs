<template>
  <div>
    <div class="flex-v-center flex-nowrap flex mn-b-medium">
      <h3 class="mn-r-medium">Reports</h3> <!-- Updated this line -->
    </div>

    <div class="cols-3 mobile:cols-1 gap-thin">
      <div 
        v-for="report in state.all"
        :key="report._id"
        class="radius-medium pd-small bg-light"
      >
        <!-- Here, you should update the properties of the report object to reflect the actual structure of a report -->
        <!-- For example, I'm using 'user', 'type', and 'reason'. You should replace them with actual report properties -->

        <p class="t-black p-small mn-b-small">
          <span class="uppercase t-transp">User</span>
          <br> 
          <span class="pd-2px radius-big d-inline-block bg-light t-semi">{{report.user}}</span> <!-- Updated this line -->
        </p>

        <p class="t-black p-small mn-b-small">
          <span class="uppercase t-transp">Type</span>
          <br> 
          <span class="pd-2px radius-big d-inline-block bg-light t-semi">{{report.type}}</span> <!-- Updated this line -->
        </p>

        <p class="t-black p-small mn-b-small">
          <span class="uppercase t-transp">Reason</span>
          <br> 
          <span class="pd-2px radius-big d-inline-block bg-light t-semi">{{report.reason}}</span> <!-- Updated this line -->
        </p>

        <div class="gap-thin flex-nowrap flex">
          <!-- Update buttons and actions as needed -->
          <button class="button-small w-100 bg-black t-white button">
            Close Report
          </button>
          <button class="button-small w-100 bg-black t-white button">
            Hide Content
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { actions as reportActions, state } from '../../store/reports'; // Update the import path

// You might want to handle other lifecycle hooks or methods depending on your needs.
// Here, I'll demonstrate using the 'deleteReport' method as an example.

const deleteReport = async (id) => {
  try {
    await reportActions.remove({ _id: id });  // Updated method name and parameter
    // Optionally, add a notification about successful deletion here
  } catch (error) {
    console.error(error);
    // Optionally, add a notification about the error here
  }
};

// Fetch all reports on component mount. This part depends on how your store is structured.
reportActions.read();  // Updated method name
</script>
