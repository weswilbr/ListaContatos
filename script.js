document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleciona os elementos principais
    const contactForm = document.getElementById('contact-form');
    const contactsList = document.getElementById('contacts-list');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const editIndexInput = document.getElementById('edit-index');
    const submitBtn = document.getElementById('submit-btn');

    // 2. Funções de gerenciamento de dados
    const getContacts = () => JSON.parse(localStorage.getItem('contacts')) || [];
    const saveContacts = (contacts) => localStorage.setItem('contacts', JSON.stringify(contacts));

    // 3. Função para resetar o formulário
    const resetForm = () => {
        contactForm.reset();
        editIndexInput.value = "";
        submitBtn.textContent = "Adicionar Contato";
        submitBtn.classList.remove('editing');
    };

    // 4. Função para renderizar os contatos na tabela
    const renderContacts = () => {
        const contacts = getContacts();
        contactsList.innerHTML = '';
        if (contacts.length === 0) {
            contactsList.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum contato cadastrado.</td></tr>';
            exportPdfBtn.disabled = true; // Desabilita o botão se não há contatos
            return;
        }
        exportPdfBtn.disabled = false; // Habilita o botão se há contatos
        contacts.forEach((contact, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${contact.nome}</td>
                <td>${contact.sobrenome}</td>
                <td>${contact.telefone}</td>
                <td>${contact.cidade}</td>
                <td>${contact.estado}</td>
                <td>
                    <button class="edit-btn" data-index="${index}">Editar</button>
                    <button class="delete-btn" data-index="${index}">Deletar</button>
                </td>
            `;
            contactsList.appendChild(row);
        });
    };

    // 5. Lógica de envio do formulário (Adicionar e Atualizar)
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const contactData = {
            nome: document.getElementById('nome').value.trim(),
            sobrenome: document.getElementById('sobrenome').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            cidade: document.getElementById('cidade').value.trim(),
            estado: document.getElementById('estado').value.trim().toUpperCase()
        };

        // MELHORIA: Validação de dados
        if (!contactData.nome || !contactData.sobrenome || !contactData.telefone || !contactData.cidade || !contactData.estado) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        if (contactData.estado.length !== 2) {
            alert("O campo Estado (UF) deve ter exatamente 2 caracteres.");
            return;
        }

        const contacts = getContacts();
        const editIndex = editIndexInput.value;

        if (editIndex !== "") { // Modo Edição
            contacts[editIndex] = contactData;
        } else { // Modo Adição
            contacts.push(contactData);
        }
        
        saveContacts(contacts);
        renderContacts();
        resetForm();
    });

    // 6. Lógica de clique na lista (para Editar ou Deletar)
    contactsList.addEventListener('click', (e) => {
        const target = e.target;
        const index = target.getAttribute('data-index');

        // Otimização: Sai da função se o clique não foi em um botão com 'data-index'
        if (!index) return;
        
        const contacts = getContacts();

        if (target.classList.contains('edit-btn')) {
            const contactToEdit = contacts[index];
            document.getElementById('nome').value = contactToEdit.nome;
            document.getElementById('sobrenome').value = contactToEdit.sobrenome;
            document.getElementById('telefone').value = contactToEdit.telefone;
            document.getElementById('cidade').value = contactToEdit.cidade;
            document.getElementById('estado').value = contactToEdit.estado;
            
            editIndexInput.value = index;
            submitBtn.textContent = "Atualizar Contato";
            submitBtn.classList.add('editing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (target.classList.contains('delete-btn')) {
            const contactToDelete = contacts[index];
            if (confirm(`Tem certeza que deseja deletar ${contactToDelete.nome} ${contactToDelete.sobrenome}?`)) {
                contacts.splice(index, 1);
                saveContacts(contacts);
                renderContacts();
                if (editIndexInput.value === index) { // Reseta o form se o item deletado estava em edição
                    resetForm();
                }
            }
        }
    });

    // 7. Lógica para exportar a lista para PDF
    const exportToPDF = () => {
        const contacts = getContacts();
        const pdfContent = document.getElementById('pdf-content');
        const today = new Date();
        const formattedDate = today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        // MELHORIA: Nome do arquivo mais limpo
        const fileDate = today.toISOString().slice(0, 10); // Formato YYYY-MM-DD
        
        let reportHTML = `
            <h1>Relatório de Contatos</h1>
            <p>Gerado em: ${formattedDate}</p>
            <table>
                <thead>
                    <tr>
                        <th>Nome Completo</th>
                        <th>Telefone</th>
                        <th>Cidade</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
        `;

        contacts.forEach(contact => {
            reportHTML += `
                <tr>
                    <td>${contact.nome} ${contact.sobrenome}</td>
                    <td>${contact.telefone}</td>
                    <td>${contact.cidade}</td>
                    <td>${contact.estado}</td>
                </tr>
            `;
        });

        reportHTML += `</tbody></table>`;
        pdfContent.innerHTML = reportHTML;
        
        const options = {
            margin:       [10, 10, 10, 10], // top, left, bottom, right
            filename:     `relatorio-contatos-${fileDate}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(options).from(pdfContent).save();
    };

    exportPdfBtn.addEventListener('click', exportToPDF);

    // 8. Renderização Inicial
    renderContacts();
});