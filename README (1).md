
# Interactive Process and Disk Scheduling Simulator with Visual Animations

## 📌 Project Overview

This project is an **educational Operating System Scheduling Simulator** designed to help students and educators understand **CPU Scheduling** and **Disk Scheduling** algorithms through **interactive visualizations** and **real-time execution flows**.  
It bridges the gap between theoretical OS concepts and practical learning by making complex scheduling behaviors easy to observe.

---

## 🚀 Features

### ✅ CPU Scheduling Algorithms Implemented:
- First Come First Serve (FCFS)
- Shortest Job First (SJF) - Both Preemptive and Non-Preemptive
- Shortest Remaining Time First (SRTF)
- Round Robin (RR)
- Priority Scheduling (Preemptive and Non-Preemptive)

### ✅ Disk Scheduling Algorithms Implemented:
- First Come First Serve (FCFS)
- Shortest Seek Time First (SSTF)
- SCAN
- C-SCAN
- LOOK
- C-LOOK

---

## 🎨 Visualizations

- **Gantt Chart** for CPU scheduling
- **Disk Head Movement Graphs** for disk scheduling algorithms
- **Real-time animations** for better understanding of algorithm flow
- **Performance Metrics Display:**
  - Waiting Time
  - Turnaround Time
  - Completion Time
  - Seek Time

---

## 🛠️ Technologies Used

| Component                | Technology              |
|--------------------------|-------------------------|
| **Frontend Framework**   | React.js                |
| **Styling**              | Tailwind CSS / CSS      |
| **Graphing Libraries**   | Chart.js / Recharts     |
| **Core Logic**           | Pure JavaScript (Modular Functions) |

---

## 🖥️ Project Architecture

- **Component-based React architecture**
- Separation of:
  - **UI Layer**
  - **Logic Layer (Algorithm Implementations)**
  - **Visualization/Output Layer**
- **State Management:** React Hooks
- **Dynamic Chart Updates:** React state + Chart.js/Recharts integration

---

## 👨‍💻 Team Members and Responsibilities

| Team Member           | Contributions |
|-----------------------|---------------|
| Utkarsh Kushwaha      | SJF, Round Robin (CPU), FCFS (Disk), Disk Algorithm Comparison Graph |
| Rohit Pant            | Priority (Preemptive) CPU, LOOK, C-LOOK (Disk), GUI, Responsiveness, Input Validations |
| Rahul Dev Kumar       | SRTF CPU, SCAN, C-SCAN (Disk), Module Integration, Step Controls |
| Dev Kumar Prajapati   | FCFS, Priority (Non-Preemptive) CPU, SSTF (Disk), Performance Metrics |

---

## ✅ Testing and Validation Status

| Test Type                          | Status  | Notes                                  |
|------------------------------------|---------|----------------------------------------|
| CPU Scheduling Functional Tests    | ✅ Pass | Works for various input scenarios      |
| Disk Scheduling Functional Tests   | ✅ Pass | Correct outputs across test cases      |
| UI Responsiveness                  | ✅ Pass | Works across different devices/screens |
| Input Validation                   | ✅ Pass | Edge cases and error handling checked  |
| Visualization Outputs              | ✅ Pass | Gantt charts & Disk head animations    |
| Performance Metrics Accuracy       | ✅ Pass | Cross-checked with manual calculations |

---

## 🎯 Final Deliverables

- ✅ Fully functional simulator for CPU and Disk scheduling
- ✅ Real-time visualizations (Gantt + Disk movement)
- ✅ Performance metric analysis and comparison
- ✅ Input validation and error handling
- ✅ Scalable and modular codebase
- ✅ Responsive React-based UI
- ✅ Documentation and usage guide

---

## 📸 Screenshots

*(Add screenshots or GIFs showing Gantt chart, Disk head movement graphs, and UI here if you want)*

---

## 📥 Setup & Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/your-repo.git

# Navigate to project directory
cd your-repo

# Install dependencies
npm install

# Run the project
npm start
```

---

## 📚 Future Enhancements (Optional)

- Export Gantt charts as images
- Add Multi-level feedback queue scheduling
- Dark Mode UI option
- More disk scheduling algorithms

---

## 📧 Contact

For any queries:

| Name                | Email                          |
|---------------------|--------------------------------|
| Utkarsh Kushwaha    | utkarshkushwaha09@gmail.com    |
| Dev Kumar Prajapati | devkumar3631@gmail.com         |
| Rahul Dev Kumar     | rdkpryj@gmail.com              |
| Rohit Pant          | Pantrohit2004@gmail.com        |
