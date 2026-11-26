const waitForGlobal = (name, timeout = 12000) => new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const check = () => {
        if (window[name]) {
            resolve(window[name]);
            return;
        }
        if (Date.now() - startedAt >= timeout) {
            reject(new Error(`No se pudo cargar la librería ${name}. Verifica la conexión e inténtalo nuevamente.`));
            return;
        }
        window.setTimeout(check, 100);
    };
    check();
});

const createQrDataUrl = async (url) => {
    const QRCode = await waitForGlobal('QRCode');
    const host = document.createElement('div');
    Object.assign(host.style, {
        position: 'fixed',
        left: '-9999px',
        top: '0',
        width: '180px',
        height: '180px',
        background: '#ffffff',
        padding: '10px',
    });
    document.body.appendChild(host);

    try {
        new QRCode(host, {
            text: url,
            width: 160,
            height: 160,
            colorDark: '#0f172a',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M,
        });
        await new Promise((resolve) => window.setTimeout(resolve, 50));
        const canvas = host.querySelector('canvas');
        const image = host.querySelector('img');
        if (canvas) return canvas.toDataURL('image/png');
        if (image?.src) return image.src;
        throw new Error('No se pudo crear el código QR de verificación.');
    } finally {
        host.remove();
    }
};

const createProvinceChart = async (topProvinces) => {
    const Chart = await waitForGlobal('Chart');
    const canvas = document.createElement('canvas');
    canvas.width = 920;
    canvas.height = 430;
    const chart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: topProvinces.map((item) => item.province),
            datasets: [{
                data: topProvinces.map((item) => item.count),
                backgroundColor: ['#dc2626', '#d97706', '#2563eb', '#475569', '#059669'],
                borderRadius: 6,
                barThickness: 34,
            }],
        },
        options: {
            indexAxis: 'y',
            responsive: false,
            animation: false,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: '#475569', font: { size: 18, weight: 600 } },
                    grid: { color: '#e2e8f0' },
                    border: { display: false },
                },
                y: {
                    ticks: { color: '#0f172a', font: { size: 18, weight: 700 } },
                    grid: { display: false },
                    border: { display: false },
                },
            },
        },
    });

    try {
        await new Promise((resolve) => window.requestAnimationFrame(resolve));
        return chart.toBase64Image('image/png', 1);
    } finally {
        chart.destroy();
    }
};

export const createReportAssets = async (reportData) => {
    const [qrDataUrl, chartDataUrl] = await Promise.all([
        createQrDataUrl(window.location.href),
        createProvinceChart(reportData.topProvinces),
    ]);
    return { qrDataUrl, chartDataUrl };
};

const addInstitutionalFooters = (pdf, qrDataUrl, cutoffLabel) => {
    const totalPages = pdf.internal.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        pdf.setPage(pageNumber);
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.25);
        pdf.line(8, pageHeight - 12.5, pageWidth - 8, pageHeight - 12.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(71, 85, 105);
        pdf.text(`Vialert-EC | Corte: ${cutoffLabel}`, 8, pageHeight - 7.2);
        pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 20, pageHeight - 7.2, { align: 'right' });
        pdf.addImage(qrDataUrl, 'PNG', pageWidth - 17, pageHeight - 11.4, 7.5, 7.5);
    }
};

export const exportReportElement = async ({ element, theme, qrDataUrl, cutoffLabel }) => {
    const html2pdf = await waitForGlobal('html2pdf');
    const landscape = theme === 'tecnico';
    const fileDate = new Date().toISOString().slice(0, 10);
    const filename = `Vialert-EC-${theme}-${fileDate}.pdf`;
    const captureHost = document.createElement('div');
    const captureElement = element.cloneNode(true);
    const sourceWidth = element.getBoundingClientRect().width;
    Object.assign(captureHost.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: '-10000',
        width: `${sourceWidth}px`,
        overflow: 'visible',
        pointerEvents: 'none',
        background: '#ffffff',
    });
    captureElement.style.width = '100%';
    captureHost.appendChild(captureElement);
    document.body.appendChild(captureHost);

    try {
        await Promise.all([...captureElement.querySelectorAll('img')].map((image) => (
            image.complete
                ? Promise.resolve()
                : new Promise((resolve) => {
                    image.addEventListener('load', resolve, { once: true });
                    image.addEventListener('error', resolve, { once: true });
                })
        )));

        const worker = html2pdf().set({
            margin: [7, 7, 17, 7],
            filename,
            image: { type: 'jpeg', quality: 0.96 },
            html2canvas: {
                scale: 1,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                scrollX: 0,
                scrollY: 0,
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: landscape ? 'landscape' : 'portrait',
                compress: true,
            },
            pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.pdf-avoid-break'] },
        }).from(captureElement).toPdf();

        const pdf = await worker.get('pdf');
        addInstitutionalFooters(pdf, qrDataUrl, cutoffLabel);
        await worker.save();
        return { filename, pages: pdf.internal.getNumberOfPages() };
    } finally {
        captureHost.remove();
    }
};
