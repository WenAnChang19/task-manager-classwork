"use strict";

const { createApp } = Vue;

createApp({
  data() {
    return {
      tasks: [],
      nextTaskId: 1,
      newTaskName: "",
      formMessage: "",
      formMessageType: "",
    };
  },
  computed: {
    totalCount() {
      return this.tasks.length;
    },
    completedCount() {
      return this.tasks.filter((task) => task.completed).length;
    },
    pendingCount() {
      return this.totalCount - this.completedCount;
    },
  },
  methods: {
    addTask() {
      const taskName = this.newTaskName.trim();
      if (!taskName) {
        this.formMessage = "請輸入任務內容。";
        this.formMessageType = "error";
        this.$refs.taskInput.focus();
        return;
      }

      this.tasks.push({ id: this.nextTaskId, name: taskName, completed: false });
      this.nextTaskId += 1;
      this.newTaskName = "";
      this.formMessage = "任務已新增。";
      this.formMessageType = "success";
      this.$nextTick(() => this.$refs.taskInput.focus());
    },
    toggleTask(taskId) {
      const task = this.tasks.find((item) => item.id === taskId);
      if (task) task.completed = !task.completed;
    },
    deleteTask(taskId) {
      const taskIds = this.tasks.map((task) => task.id);
      const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return;

      this.tasks.splice(taskIndex, 1);
      this.formMessage = "任務已刪除。";
      this.formMessageType = "success";
      const nextFocusId = taskIds[taskIndex + 1] ?? taskIds[taskIndex - 1];
      this.$nextTick(() => {
        const nextButton = document.querySelector(
          `.delete-button[data-task-id="${nextFocusId}"]`,
        );
        (nextButton ?? this.$refs.taskInput).focus();
      });
    },
  },
}).mount("#vue-app");
