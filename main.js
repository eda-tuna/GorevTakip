const saveTaskDOM = document.getElementById("save-task");
const deleteTaskDOM = document.getElementById("delete-task");
const allCleanDOM = document.getElementById("all-clean-task");
const allCleanPersonDOM = document.getElementById("all-clean-person");
const taskTitleDOM = document.getElementById("taskTitle");
const addPersonDOM = document.getElementById("add-person");
const taskDOM = document.getElementById("task");



class Task {
    constructor(id, title) {
        this.id = id;
        this.title = title;
    }
}


class Person{
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}


let taskList = JSON.parse(localStorage.getItem("task") || "{}");
let personList = JSON.parse(localStorage.getItem("person") || "[]");

// Görevleri Tabloya Ekleme
class Add {
 
    static renderTasks(personId) {
        const tasks = taskList[personId] || [];  
    
        if (!Array.isArray(tasks)) {
            console.error(`Geçersiz görev ID: ${personId}, görevler: ${tasks}`);
            return; // Dizi değilse işlemi durdur
        }
    
        const taskDOM = document.getElementById(`task-${personId}`);
        if (!taskDOM) {
            console.warn(`Element with id 'task-${personId}' not found.`);
            return;
        } 
        
        let result = tasks.length === 0 ? "Liste Boş" : tasks.map(task => 
        `<li> 
        ${task.title}
        <button data-id="${personId}" data-task-id="${task.id}"  class="btn-delete btn btn-danger btn-sm remove"><i class="fa-solid fa-eraser"></i> Sil</button>
        </li> `).join("");
        taskDOM.innerHTML = `<ul>${result}</ul>`;

        taskDOM.querySelectorAll(".btn-delete").forEach(button => {
            button.addEventListener("click", function () {
                const taskId = parseInt(this.getAttribute("data-task-id"), 10);
                const personId = parseInt(this.getAttribute("data-id"), 10);
                Delete.deleteSelectedTask(personId, taskId);
            });
        });
        
    }


    static addPerson() {
        const addPersonDOM = document.getElementById("add-person");
        addPersonDOM.addEventListener("click", function () {
            let personName = prompt("Eklenecek ekip üyesi adını giriniz.");
      
          
            if (personName) {
                const newPersonId = personList.length ? personList[personList.length - 1].id + 1 : 1;   
                const newPerson = new Person(newPersonId, personName);
                personList.push(newPerson);
                Database.savePerson();
                Add.addNewPerson(newPerson);
                Add.renderTasks(newPerson.id);
                
            }
        }
    )};
   

    static addNewPerson(person) {
        const taskDOM = document.querySelector("tbody");
        
        if (!taskDOM) {
            console.error("taskDOM bulunamadı!");
            return;
        }

        const personRow = document.createElement("tr");
        personRow.id = `person-${person.id}`;
        personRow.innerHTML = `
                    <td>${person.id}</td>
                    <td>${person.name ? person.name.toUpperCase() : "Belirtilmedi"}</td>    
                    <td id="task-${person.id}">-</td>
                    <td>
                        <button data-id="${person.id}" data-bs-toggle="modal" data-bs-target="#taskModal" class="btn-add btn btn-success btn-sm"><i class="fa-solid fa-address-book"></i> Ekle</button>
                    </td>
                 
        `;
        taskDOM.appendChild(personRow);
        Add.addTaskEvent(person.id);
    }

    static addTaskEvent(personId, taskId) {
        const addBtn = document.querySelector(`#person-${personId} .btn-add`);
        const deleteBtn = document.querySelector(`#person-${personId} .btn-delete`);

        if (addBtn) {
            addBtn.addEventListener("click", () => {
                saveTaskDOM.setAttribute("data-id", personId);
                saveTaskDOM.setAttribute("data-person-id", personId);
                console.log(`Görev ekleme için seçilen ID: ${personId}`);
            });
        } else {
            console.error(`addBtn bulunamadı! ID: person-${personId}`);
        }

        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
                Delete.deleteSelectedTask(personId, taskId);
                console.log(`Görev silme için seçilen ID: ${personId}`);
            });
        } else {
            console.log("deleteBtn tıklandı!");
        }
    }       
}

function addTaskToPerson(personId, taskId) {
    if (!taskList[taskId]) {
        taskList[taskId] = [];
    }

    taskList[taskId].push(new Task(taskId, "Görev Başlığı"));
    console.log(`Görev ID ${taskId}, kişi ID ${personId} ile ilişkilendirildi.`);
    Database.saveTasks();
}




saveTaskDOM.addEventListener("click", function(e){
    e.preventDefault();
    
    let personId = saveTaskDOM.getAttribute("data-id");
    let title = taskTitleDOM.value;

    if(title === "") {
        return;
    }


    if (!taskList[personId]) {
        taskList[personId] = []; 
    }
    
    const newTask = new Task(Date.now(), title); // ID'yi otomatik olarak veriyoruz
    taskList[personId].push(newTask); 
    taskTitleDOM.value = "";
    Add.renderTasks(personId); 
    Database.saveTasks(); 
});


document.querySelectorAll(".btn-add").forEach(button => {
    button.addEventListener("click", function () {
        const taskId = button.getAttribute("data-id");
        const personId = button.getAttribute("data-person-id");
        console.log("Eklenecek seçilen Görev ID:", taskId); 
        saveTaskDOM.setAttribute("data-id", taskId); 
        saveTaskDOM.setAttribute("data-person-id", personId); 
    });
});




class Delete {
    static deleteSelectedTask(personId, taskId) {
        if (taskList[personId]) {
            taskList[personId] = taskList[personId].filter(task => task.id !== taskId);
            Database.saveTasks();
            Add.renderTasks(personId);
        } else {
            console.warn(`Kişi ID bulunamadı: ${personId}`);
        }
    }


    static allCleanTasks() {
        taskList = {};
        Database.saveTasks();
        document.querySelectorAll("[id^='task-']").forEach(taskCell => taskCell.innerHTML = "Liste Boş");
    }

    static allCleanPersons() {
        personList = [];
        taskList = {};
        Database.savePerson();
        Database.saveTasks();

        const tbody = document.querySelector("tbody");
        if (tbody) {
            tbody.innerHTML = ""; // Tüm satırları kaldır
        }
    }
}

document.getElementById("all-clean-person").addEventListener("click", () => {
        Delete.allCleanPersons();
    })


document.getElementById("all-clean-task").addEventListener("click", () => {
        Delete.allCleanTasks();
    })

 

class Database{
    //verileri LocalStorage'dan alma    
    static saveTasks() {
        localStorage.setItem("task", JSON.stringify(taskList));
    }

    static savePerson() {
        localStorage.setItem("person", JSON.stringify(personList));
    }

    static load() {
        taskList = JSON.parse(localStorage.getItem("task") || "[]");
        personList = JSON.parse(localStorage.getItem("person") || "[]");
        personList.forEach(person => {
            Add.addNewPerson(person)
            Add.renderTasks(person.id)
        });
    }
}

async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Veri yüklenemedi');
        const data = await response.json();

        // Veriyi yükledikten sonra gerekli işlemleri yapabilirsiniz.
        console.log(data);
    } catch (error) {
        console.error('JSON dosyası yüklenirken hata oluştu:', error);
    }
}

// Sayfa yüklendiğinde JSON dosyasını yükle
window.onload = function() {
    loadData();
};


window.addEventListener("DOMContentLoaded", function () {
    Add.addPerson();
    Database.load();
});
