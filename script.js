document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleciona os elementos principais do HTML com os quais vamos interagir
    const contactForm = document.getElementById('contact-form');
    const contactsList = document.getElementById('contacts-list');
    const exportPdfBtn = document.getElementById('export-pdf-btn');

    // 2. Funções para gerenciar os dados no localStorage (armazenamento do navegador)
    
    // Pega a lista de contatos do localStorage. Se não houver nada, retorna um array vazio.
    const getContacts = () => {
        return JSON.parse(localStorage.getItem('contacts')) || [];
    };

    // Salva a lista de contatos no localStorage.
    const saveContacts = (contacts) => {
        localStorage.setItem('contacts', JSON.stringify(contacts));
    };

    // 3. Função para renderizar (desenhar) os contatos na tabela da página
    const renderContacts = () => {
        const contacts = getContacts();
        contactsList.innerHTML = ''; // Limpa a tabela antes de adicionar os novos itens

        // Se não houver contatos, exibe uma mensagem na tabela
        if (contacts.length === 0) {
            contactsList.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum contato cadastrado.</td></tr>';
            return;
        }

        // Para cada contato no array, cria uma nova linha (<tr>) na tabela
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

    // 4. Lógica para adicionar um novo contato
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o comportamento padrão do formulário (recarregar a página)

        // Cria um objeto com os dados dos campos do formulário
        const newContact = {
            nome: document.getElementById('nome').value.trim(),
            sobrenome: document.getElementById('sobrenome').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            cidade: document.getElementById('cidade').value.trim(),
            estado: document.getElementById('estado').value.trim().toUpperCase()
        };

        const contacts = getContacts(); // Pega a lista atual
        contacts.push(newContact);      // Adiciona o novo contato
        saveContacts(contacts);         // Salva a lista atualizada

        renderContacts();               // Atualiza a exibição na tela
        contactForm.reset();            // Limpa os campos do formulário
    });

    // 5. Lógica para deletar um contato
    contactsList.addEventListener('click', (e) => {
        // Verifica se o elemento clicado foi um botão com a classe 'delete-btn'
        if (e.target.classList.contains('delete-btn')) {
            // Pega o 'index' do contato a ser removido, que guardamos no botão
            const index = e.target.getAttribute('data-index');
            
            const contacts = getContacts();
            contacts.splice(index, 1); // Remove o item do array na posição 'index'
            saveContacts(contacts);    // Salva a lista modificada

            renderContacts();          // Atualiza a exibição na tela
        }
    });

    // 6. Lógica para exportar a lista para PDF
    const exportToPDF = () => {
        const contacts = getContacts();
        if (contacts.length === 0) {
            alert("Não há contatos para exportar!");
            return;
        }

        const pdfContent = document.getElementById('pdf-content');

        // Cria uma data formatada para o cabeçalho do relatório
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
        pdfContent.innerHTML = reportHTML; // Insere o HTML gerado no elemento oculto

        // Configurações para a geração do PDF
        const options = {
            margin:       10, // Margem em mm
            filename:     `relatorio-contatos-${Date.now()}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Chama a biblioteca para gerar e baixar o PDF a partir do elemento oculto
        html2pdf().set(options).from(pdfContent).save();
    };

    // Adiciona o evento de clique ao botão de exportar
    exportPdfBtn.addEventListener('click', exportToPDF);

    // 7. Renderização Inicial
    // Assim que a página carrega, chama a função para exibir os contatos que já estão salvos
    renderContacts();
});