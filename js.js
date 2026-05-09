// =========================
// DATA
// =========================
let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let plan = JSON.parse(localStorage.getItem("plan")) || [];

// =========================
// LOAD
// =========================
window.onload = function () {
    displaySubjects();
    displayPlan();
};

// =========================
// ➕ ADD SUBJECT
// =========================
function addSubject() {
    let name = document.getElementById("subject").value.trim();
    let difficulty = parseInt(document.getElementById("difficulty").value);
    let examDate = document.getElementById("examDate").value;

    if (!name) return alert("Enter subject name");
    if (!examDate) return alert("Select exam date");
    let priority = "";

    if (difficulty == 3) {
    priority = "High";
    }
    else if (difficulty == 2) {
        priority = "Medium";
    }
    else {
        priority = "Low";
    }

    subjects.push({
        name,
        difficulty,
        examDate,
        priority
    });

    localStorage.setItem("subjects", JSON.stringify(subjects));

    document.getElementById("subject").value = "";
    document.getElementById("examDate").value = "";

    displaySubjects();
}

// =========================
// 📝 EXAM PERFORMANCE RATING
// =========================
function displayRatings() {

    let list = document.getElementById("ratingList");
    list.innerHTML = "";

    if (subjects.length === 0) {
        list.innerHTML = "<li>No subjects added yet</li>";
        return;
    }

    subjects.forEach((sub) => {

        let subjectName = sub.name + " EXAM";

        let savedRating = localStorage.getItem("rating_" + subjectName) || "";

        let message = "";

        if (savedRating === "Excellent") message = "🎉 Amazing performance!";
        else if (savedRating === "Good") message = "👏 Good job!";
        else if (savedRating === "Average") message = "📚 You can improve!";
        else if (savedRating === "Poor") message = "💪 Keep trying!";

        let li = document.createElement("li");

        li.innerHTML = `
            <div style="width:100%">
                <strong>${subjectName}</strong>

                <select onchange="saveRating('${subjectName}', this.value)">
                    <option value="">Select Rating</option>
                    <option value="Excellent" ${savedRating === "Excellent" ? "selected" : ""}>⭐ Excellent</option>
                    <option value="Good" ${savedRating === "Good" ? "selected" : ""}>👍 Good</option>
                    <option value="Average" ${savedRating === "Average" ? "selected" : ""}>😐 Average</option>
                    <option value="Poor" ${savedRating === "Poor" ? "selected" : ""}>❌ Poor</option>
                </select>

                <p style="margin-top:8px;color:#4CAF50;font-weight:600;">
                    ${message}
                </p>
            </div>
        `;

        list.appendChild(li);
    });
}

// =========================
// 💾 SAVE RATING
// =========================
function saveRating(subject, value) {

    localStorage.setItem("rating_" + subject, value);

    displayRatings();
}

// =========================
// 📌 DISPLAY SUBJECTS
// =========================
function displaySubjects() {
    let list = document.getElementById("subjectList");
    list.innerHTML = "";

    if (subjects.length === 0) {
        list.innerHTML = "<li>No subjects added yet</li>";
        return;
    }

    subjects.forEach((sub, index) => {
            let li = document.createElement("li");
            let priorityClass = "";

            if (sub.priority === "High") {
                priorityClass = "high-priority";
            }
            else if (sub.priority === "Medium") {
                priorityClass = "medium-priority";
            }
            else {
                priorityClass = "low-priority";
            }

            li.innerHTML = `
                <span>
                    ${sub.name}
                    <span class="${priorityClass}">
                        ⭐ ${sub.priority}
                    </span>
                    (Level ${sub.difficulty})
                    📅 ${sub.examDate}
                </span>

                <button onclick="deleteSubject(${index})">❌</button>
            `;

            list.appendChild(li);
        });
}

// =========================
// ❌ DELETE SUBJECT
// =========================
function deleteSubject(index) {
    subjects.splice(index, 1);
    localStorage.setItem("subjects", JSON.stringify(subjects));
    displaySubjects();
}

// =========================
// 🧹 CLEAR ALL SUBJECTS
// =========================
function clearSubjects() {
    if (!confirm("Clear all subjects?")) return;

    subjects = [];
    plan = [];

    localStorage.removeItem("subjects");
    localStorage.removeItem("plan");
    localStorage.removeItem("darkMode");

    displaySubjects();
    displayPlan();
}

// =========================
// 📘 GENERATE PLAN (PRO LOGIC)
// =========================
function generatePlan() {
    if (subjects.length === 0) {
        return alert("Add subjects first!");
    }

    let today = new Date();

    let examDates = subjects.map(s => new Date(s.examDate));
    let lastExam = new Date(Math.max(...examDates));

    plan = [];

    let weighted = [];
    subjects.forEach(sub => {
        for (let i = 0; i < sub.difficulty; i++) {
            weighted.push(sub);
        }
    });

    let index = 0;
    let dayCount = 1;

    let current = new Date(today);

    while (current <= lastExam) {

        let formatted = current.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
        });

        let examSubjects = subjects.filter(sub =>
            new Date(sub.examDate).toDateString() === current.toDateString()
        );

        let isRevisionDay = subjects.some(sub => {
            let exam = new Date(sub.examDate);
            let rev = new Date(exam);
            rev.setDate(rev.getDate() - 1);
            return current.toDateString() === rev.toDateString();
        });

        // ⭐ 1. EXAM DAY (HIGHEST PRIORITY)
        if (examSubjects.length > 0) {

            examSubjects.forEach(sub => {
                plan.push({
                    day: dayCount,
                    date: formatted,
                    subject: `📌 ${sub.name} EXAM`,
                    done: false,
                    type: "exam"
                });
            });

        }
        // ⭐ 2. REVISION DAY
        
        if (isRevisionDay) 
            {
            let revisionSubject = subjects.find(sub => {
                let exam = new Date(sub.examDate);
                let rev = new Date(exam);
                rev.setDate(rev.getDate() - 1);
                return current.toDateString() === rev.toDateString();
            });

            if (revisionSubject) 
                {
                    plan.push({
                        day: dayCount,
                        date: formatted,
                        subject: `🔥 Revise ${revisionSubject.name}`,
                        done: false,
                        type: "revision"
                    });
                }
            }

        if (examSubjects.length > 0) {
            examSubjects.forEach(sub => {
                plan.push({
                    day: dayCount,
                    date: formatted,
                    subject: `📌 ${sub.name} EXAM`,
                    done: false,
                    type: "exam"
                });
            });
}

        // ⭐ 3. STUDY DAY
        else {

            let availableSubjects = subjects.filter(sub => {
                let examDate = new Date(sub.examDate);
                let todayDate = new Date(current);

                examDate.setHours(0,0,0,0);
                todayDate.setHours(0,0,0,0);

                return examDate.getTime() >= todayDate.getTime();
            });

            if (availableSubjects.length > 0) {

                let subject = availableSubjects[index % availableSubjects.length];

                plan.push({
                    day: dayCount,
                    date: formatted,
                    subject: subject.name,
                    done: false,
                    type: "study"
                });

                index++;
            }
        }

        dayCount++;
        current.setDate(current.getDate() + 1);
    }

    

    localStorage.setItem("plan", JSON.stringify(plan));
    displayPlan();
}

// =========================
// 📊 SUBJECT-WISE PROGRESS
// =========================
function updateSubjectProgress() {

    let container = document.getElementById("subjectProgressList");

    container.innerHTML = "";

    if (subjects.length === 0 || plan.length === 0) {
        container.innerHTML = "<li>No progress yet</li>";
        return;
    }

    subjects.forEach(sub => {

        let relatedPlans = plan.filter(
            p =>
            p.type === "study" &&
            p.subject.trim().toLowerCase()
            ===
            sub.name.trim().toLowerCase()
        );
        

        let completed = relatedPlans.filter(
            p => p.done
        ).length;

        let percent = relatedPlans.length === 0
            ? 0
            : Math.round((completed / relatedPlans.length) * 100);

        let li = document.createElement("li");

        li.classList.add("subject-progress-item");

        li.innerHTML = `
            <div class="subject-progress-header">
                <span>${sub.name}</span>
                <span>${percent}%</span>
            </div>

            <div class="subject-progress-bar">
                <div class="subject-progress-fill"
                     style="width:${percent}%">
                </div>
            </div>
        `;

        container.appendChild(li);
    });
}


// =========================
// 📅 DISPLAY PLAN
// =========================
function displayPlan() {
    let list = document.getElementById("planList");
    list.innerHTML = "";
    updateProgress();
    updateSubjectProgress();
    displayRatings();
    if (plan.length === 0) {
        list.innerHTML = "<li>No plan generated yet</li>";
        return;
    }

    plan.forEach((item, index) => {

        let li = document.createElement("li");
        li.classList.add("plan-item");

        // ⭐ highlight exam day
        if (item.type === "exam") {
            li.style.background = "rgba(255,0,0,0.2)";
        }

        // ⭐ highlight revision
        if (item.type === "revision") {
            li.style.background = "rgba(255,165,0,0.2)";
        }

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.done;

        let text = document.createElement("span");
        text.textContent = `Day ${item.day} (${item.date}): ${item.subject}`;

        if (item.done) {
            text.style.textDecoration = "line-through";
        }

        checkbox.onchange = () => {
            plan[index].done = checkbox.checked;
            localStorage.setItem("plan", JSON.stringify(plan));
            displayPlan();
            updateProgress();
            updateSubjectProgress();
            displayRatings();
        };

        li.appendChild(checkbox);
        li.appendChild(text);

        list.appendChild(li);
    });

    updateProgress(); 
    updateSubjectProgress();
    displayRatings();
}

// =========================
// 📊 ANIMATED PROGRESS BAR
// =========================
function updateProgress() {

    let completed = plan.filter(p => p.done).length;

    let percent =
        plan.length === 0
        ? 0
        : (completed / plan.length) * 100;

    percent = Math.round(percent);

    // Header progress
    document.getElementById("headerprogress").innerText =
        percent + "%";

    // Bottom progress text
    document.getElementById("progressLabel").innerText =
        percent + "% Completed";

    // Progress bar
    document.getElementById("progressFill").style.width =
        percent + "%";
}



// =========================
// 🌙 DARK MODE
// =========================
window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("darkToggle");

    if (localStorage.getItem("darkMode") === "on") {
        document.body.classList.add("dark");
    }

    btn.onclick = () => {
        document.body.classList.toggle("dark");

        localStorage.setItem(
            "darkMode",
            document.body.classList.contains("dark") ? "on" : "off"
        );
    };
});