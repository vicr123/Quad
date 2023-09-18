class JobQueue {
    constructor() {
        this.jobs = [];
        this.running = false;
    }

    addJob(job) {
        this.jobs.push(job);  // Add the job to the end of the queue
        if (!this.running) {
            this.run();
        }
    }

    async run() {
        if (this.jobs.length === 0) {
            this.running = false;
            return;
        }
        this.running = true;
        let job = this.jobs.shift(); // Get the first job in the queue
        await job(); // Execute the job
        setTimeout(() => this.run(), 1000); // Wait a second before executing the next job
    }
}

module.exports = JobQueue;