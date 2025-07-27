document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos principais do HTML
    const contactForm = document.getElementById('contact-form');
    const contactsList = document.getElementById('contacts-list');
    const exportPdfBtn = document.getElementById('export-pdf-btn');

    // Função para buscar os contatos do localStorage (armazenamento do navegador)
    const getContacts = () => {
        return JSON.parse(localStorage.getItem('contacts')) || [];
    };

    // Função para salvar os contatos no localStorage
    const saveContacts = (contacts) => {
        localStorage.setItem('contacts', JSON.stringify(contacts));
    };

    // Função para exibir os contatos na tabela da página
    const renderContacts = () => {
        const contacts = getContacts();
        contactsList.innerHTML = ''; // Limpa a tabela antes de adicionar os itens

        if (contacts.length === 0) {
            contactsList.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum contato cadastrado.</td></tr>';
            return;
        }

        contacts.forEach((contact, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${contact.nome}</td>
                <td>${contact.sobrenome}</td>
                <td>${contact.telefone}</td>
                <td>${contact.cidade}</td>
                <td>${contact.estado}</td>
                <td><button class="delete-btn" data-index="${index}">Deletar</button></td>
            `;
            contactsList.appendChild(row);
        });
    };

    // Evento para o envio do formulário (adicionar novo contato)
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede que a página recarregue

        const newContact = {
            nome: document.getElementById('nome').value.trim(),
            sobrenome: document.getElementById('sobrenome').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            cidade: document.getElementById('cidade').value.trim(),
            estado: document.getElementById('estado').value.trim().toUpperCase()
        };

        const contacts = getContacts();
        contacts.push(newContact);
        saveContacts(contacts);

        renderContacts(); // Atualiza a tabela na tela
        contactForm.reset(); // Limpa os campos do formulário
    });

    // Evento para deletar um contato (usando delegação de eventos)
    contactsList.addEventListener('click', (e) => {
        // Verifica se o clique foi no botão de deletar
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            
            const contacts = getContacts();
            contacts.splice(index, 1); // Remove o contato do array
            saveContacts(contacts);

            renderContacts(); // Atualiza a tabela
        }
    });

    // Função para exportar a lista para PDF
    const exportToPDF = () => {
        const contacts = getContacts();
        if (contacts.length === 0) {
            alert("Não há contatos para exportar!");
            return;
        }

        const pdfContent = document.getElementById('pdf-content');

        // Cria a data formatada para o cabeçalho do relatório
        const today = new Date();
        const formattedDate = today.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        // Monta o HTML do relatório que será impresso no PDF
        let reportHTML = `
            <h1>Relatório de Contatos</h1>
            <p>Gerado em: ${formattedDate}</p>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Sobrenome</th>
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
                    <td>${contact.nome}</td>
                    <td>${contact.sobrenome}</td>
                    <td>${contact.telefone}</td>
                    <td>${contact.cidade}</td>
                    <td>${contact.estado}</td>
                </tr>
            `;
        });

        reportHTML += `</tbody></table>`;
        pdfContent.innerHTML = reportHTML;

        // Configurações para a geração do PDF
        const options = {
            margin:       10, // Margem em mm
            filename:     `relatorio-contatos-${Date.now()}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Chama a biblioteca para gerar e baixar o PDF
        html2pdf().set(options).from(pdfContent).save();
    };

    // Adiciona o evento de clique ao botão de exportar
    exportPdfBtn.addEventListener('click', exportToPDF);

    // Renderiza os contatos que já estão salvos ao carregar a página
    renderContacts();
});
