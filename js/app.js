// app.js - Birra Dashboard

let data = [];
let years = [];
let players = ['CFC', 'JCR', 'JSP', 'DMP', 'DSS'];

async function loadData() {
    try {
        const response = await fetch('./combined_birra_data.csv');
        const text = await response.text();
        const lines = text.split('\n');
        lines.shift(); // remove header
        for (const line of lines) {
            if (!line.trim()) continue;
            const cols = line.split(',');
            if (cols.length >= 6) {
                const [date, cfc, jcr, jsp, dmp, dss] = cols;
                data.push({
                    date,
                    CFC: +cfc,
                    JCR: +jcr,
                    JSP: +jsp,
                    DMP: +dmp,
                    DSS: +dss
                });
            }
        }
        years = [...new Set(data.map(d => d.date.split('-')[0]))].sort();
        populateYearDropdown();
        initializeOverview();
        initializePlayers();
        initializeNavigation();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function populateYearDropdown() {
    const dropdown = document.getElementById('yearDropdown');
    dropdown.innerHTML = '';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        dropdown.appendChild(option);
    });
    // Set default to 2025
    if (years.includes('2025')) {
        dropdown.value = '2025';
    }
}

function initializeOverview() {
    createYearTable();
    drawYearChart();
    drawPlayerChart();
    drawMonthChart();
}

function createYearTable() {
    const tableDiv = document.getElementById('year-table');
    const table = document.createElement('table');
    const header = table.insertRow();
    header.insertCell().textContent = 'Year';
    players.forEach(p => header.insertCell().textContent = p);
    header.insertCell().textContent = 'Total';

    years.forEach(year => {
        const row = table.insertRow();
        row.insertCell().textContent = year;
        let yearTotal = 0;
        players.forEach(p => {
            const sum = data.filter(d => d.date.startsWith(year)).reduce((s, d) => s + d[p], 0);
            row.insertCell().textContent = sum;
            yearTotal += sum;
        });
        row.insertCell().textContent = yearTotal;
    });

    tableDiv.appendChild(table);
}

function drawYearChart() {
    const canvas = document.getElementById('yearChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const yearlyTotals = years.map(year => data.filter(d => d.date.startsWith(year)).reduce((s, d) => s + d.CFC + d.JCR + d.JSP + d.DMP + d.DSS, 0));
    const max = Math.max(...yearlyTotals);
    const barWidth = width / years.length - 10;

    years.forEach((year, i) => {
        const barHeight = (yearlyTotals[i] / max) * (height - 40);
        ctx.fillStyle = '#BAE305';
        ctx.fillRect(i * (barWidth + 10) + 5, height - barHeight - 20, barWidth, barHeight);
        ctx.fillStyle = '#000';
        ctx.fillText(year, i * (barWidth + 10) + 5, height - 5);
        ctx.fillText(yearlyTotals[i], i * (barWidth + 10) + 5, height - barHeight - 25);
    });
}

function drawPlayerChart() {
    const canvas = document.getElementById('playerChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const playerTotals = players.map(p => data.reduce((s, d) => s + d[p], 0));
    const max = Math.max(...playerTotals);
    const barWidth = width / players.length - 10;

    players.forEach((p, i) => {
        const barHeight = (playerTotals[i] / max) * (height - 40);
        ctx.fillStyle = '#E3BA05';
        ctx.fillRect(i * (barWidth + 10) + 5, height - barHeight - 20, barWidth, barHeight);
        ctx.fillStyle = '#000';
        ctx.fillText(p, i * (barWidth + 10) + 5, height - 5);
        ctx.fillText(playerTotals[i], i * (barWidth + 10) + 5, height - barHeight - 25);
    });
}

function drawMonthChart() {
    const canvas = document.getElementById('monthChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthlyTotals = months.map(m => data.filter(d => d.date.split('-')[1] === m).reduce((s, d) => s + d.CFC + d.JCR + d.JSP + d.DMP + d.DSS, 0));
    const max = Math.max(...monthlyTotals);
    const barWidth = width / months.length - 5;

    months.forEach((m, i) => {
        const barHeight = (monthlyTotals[i] / max) * (height - 40);
        ctx.fillStyle = '#E3D405';
        ctx.fillRect(i * (barWidth + 5) + 2, height - barHeight - 20, barWidth, barHeight);
        ctx.fillStyle = '#000';
        ctx.fillText(m, i * (barWidth + 5) + 2, height - 5);
    });
}

function initializePlayers() {
    document.getElementById('playerDropdown').addEventListener('change', updatePlayerInsights);
    document.getElementById('yearDropdown').addEventListener('change', updatePlayerInsights);
    document.getElementById('insightDropdown').addEventListener('change', (e) => {
        const targetId = e.target.value;
        document.querySelectorAll('.insight-section').forEach(sec => sec.classList.remove('active'));
        const target = document.getElementById(targetId);
        target.classList.add('active');
    });
    // Default to first
    document.getElementById('insightDropdown').value = 'individual';
    document.getElementById('individual').classList.add('active');
    updatePlayerInsights();
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const sections = document.querySelectorAll('main > section');
            sections.forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none';
            });
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    // Default to overview
    document.querySelector('nav a[href="#overview"]').click();
}

function updatePlayerInsights() {
    const player = document.getElementById('playerDropdown').value;
    const year = document.getElementById('yearDropdown').value;
    computeIndividualConsumption(player, year);
    computeOverallConsumption(year);
    computeYearlyTrends(player);
    computeMonthlyStats(player, year);
    computeStreaks(player, year);
    computeRelativeRankings(player, year);
    computeWeekdays(player, year);
    computeMonthlyTrends(player, year);
    computeHighConsumption(player, year);
    computeHistoricalStreaks(player);
    computeTopDays(year);
}

function computeIndividualConsumption(player, year) {
    const div = document.getElementById('individual-content');
    const playerData = data.filter(d => d.date.startsWith(year)).map(d => d[player]);
    const total = playerData.reduce((s, v) => s + v, 0);
    const max = Math.max(...playerData);
    const media = total / playerData.length;
    const mediana = median(playerData);
    const desviacion = stdDev(playerData);
    const drinkingData = playerData.filter(v => v > 0);
    const mediaBebiendo = drinkingData.length ? drinkingData.reduce((s, v) => s + v, 0) / drinkingData.length : 0;
    const medianaBebiendo = median(drinkingData);
    const desviacionBebiendo = stdDev(drinkingData);
    const dias10 = playerData.filter(v => v >= 10).length;
    const dias6_9 = playerData.filter(v => v >= 6 && v < 10).length;
    const dias3_5 = playerData.filter(v => v >= 3 && v <= 5).length;
    const dias1_2 = playerData.filter(v => v >= 1 && v <= 2).length;

    div.innerHTML = `
        <p><span class="stat-label">Total:</span> <span class="stat-value">${total}</span></p>
        <p><span class="stat-label">Maximo en un dia:</span> <span class="stat-value">${max}</span></p>
        <p><span class="stat-label">Media:</span> <span class="stat-value">${media.toFixed(2)}</span></p>
        <p><span class="stat-label">Mediana:</span> <span class="stat-value">${mediana}</span></p>
        <p><span class="stat-label">Desviación:</span> <span class="stat-value">${desviacion.toFixed(2)}</span> (<span class="stat-value">${((desviacion / media) * 100).toFixed(2)}%</span>)</p>
        <p><span class="stat-label">Media bebiendo:</span> <span class="stat-value">${mediaBebiendo.toFixed(2)}</span></p>
        <p><span class="stat-label">Mediana bebiendo:</span> <span class="stat-value">${medianaBebiendo}</span></p>
        <p><span class="stat-label">Desviación bebiendo:</span> <span class="stat-value">${desviacionBebiendo.toFixed(2)}</span> (<span class="stat-value">${((desviacionBebiendo / mediaBebiendo) * 100).toFixed(2)}%</span>)</p>
        <p><span class="stat-label">Dias con 10 o más:</span> <span class="stat-value">${dias10}</span> (<span class="stat-value">${((dias10 / playerData.length) * 100).toFixed(2)}%</span>)</p>
        <p><span class="stat-label">Dias con 6-9:</span> <span class="stat-value">${dias6_9}</span> (<span class="stat-value">${((dias6_9 / playerData.length) * 100).toFixed(2)}%</span>)</p>
        <p><span class="stat-label">Dias con 3-5:</span> <span class="stat-value">${dias3_5}</span> (<span class="stat-value">${((dias3_5 / playerData.length) * 100).toFixed(2)}%</span>)</p>
        <p><span class="stat-label">Dias con 1-2:</span> <span class="stat-value">${dias1_2}</span> (<span class="stat-value">${((dias1_2 / playerData.length) * 100).toFixed(2)}%</span>)</p>
    `;
}

function computeOverallConsumption(year) {
    const div = document.getElementById('overall-content');
    const yearData = data.filter(d => d.date.startsWith(year));
    const totalAnual = yearData.reduce((s, d) => s + d.CFC + d.JCR + d.JSP + d.DMP + d.DSS, 0);
    const maxDia = Math.max(...yearData.map(d => d.CFC + d.JCR + d.JSP + d.DMP + d.DSS));
    const mediaCabeza = totalAnual / 5;
    const minDia = Math.min(...yearData.map(d => d.CFC + d.JCR + d.JSP + d.DMP + d.DSS));
    const mediaDiaria = totalAnual / yearData.length;
    const totals = yearData.map(d => d.CFC + d.JCR + d.JSP + d.DMP + d.DSS);
    const moda = mode(totals);
    const diasModa = totals.filter(t => t === moda).length;
    const mediana = median(totals);
    const desviacion = stdDev(totals);

    div.innerHTML = `
        <p><span class="stat-label">Total anual:</span> <span class="stat-value">${totalAnual}</span> (<span class="stat-value">${mediaCabeza.toFixed(2)}</span> por cabeza)</p>
        <p><span class="stat-label">Máximo en un día:</span> <span class="stat-value">${maxDia}</span></p>
        <p><span class="stat-label">Mínimo en un día:</span> <span class="stat-value">${minDia}</span></p>
        <p><span class="stat-label">Media diaria:</span> <span class="stat-value">${mediaDiaria.toFixed(2)}</span> (<span class="stat-value">${(mediaDiaria / 5).toFixed(2)}</span> por cabeza)</p>
        <p><span class="stat-label">Moda:</span> <span class="stat-value">${moda}</span> (<span class="stat-value">${(moda / 5).toFixed(2)}</span> por cabeza)</p>
        <p><span class="stat-label">Días en la moda:</span> <span class="stat-value">${diasModa}</span></p>
        <p><span class="stat-label">Mediana:</span> <span class="stat-value">${mediana}</span> (<span class="stat-value">${(mediana / 5).toFixed(2)}</span> por cabeza)</p>
        <p><span class="stat-label">Desviación:</span> <span class="stat-value">${desviacion.toFixed(2)}</span> (<span class="stat-value">${((desviacion / (totalAnual / yearData.length)) * 100).toFixed(2)}%</span>)</p>
    `;
}

function computeYearlyTrends(player) {
    const div = document.getElementById('yearly-content');
    const yearlyTotals = years.map(y => data.filter(d => d.date.startsWith(y)).reduce((s, d) => s + d[player], 0));
    let content = '';
    for (let i = 1; i < years.length; i++) {
        const variacion = yearlyTotals[i] - yearlyTotals[i-1];
        const porcentual = ((variacion / yearlyTotals[i-1]) * 100).toFixed(2);
        content += `<p><span class="stat-label">${years[i]}:</span> Variación <span class="stat-value">${variacion}</span>, <span class="stat-value">${porcentual}%</span></p>`;
    }
    const media = yearlyTotals.reduce((s, v) => s + v, 0) / yearlyTotals.length;
    const mediana = median(yearlyTotals);
    const desviacion = stdDev(yearlyTotals);
    content += `<p><span class="stat-label">Media:</span> <span class="stat-value">${media.toFixed(2)}</span></p><p><span class="stat-label">Mediana:</span> <span class="stat-value">${mediana}</span></p><p><span class="stat-label">Desviación:</span> <span class="stat-value">${desviacion.toFixed(2)}</span> (<span class="stat-value">${((desviacion / media) * 100).toFixed(2)}%</span>)</p>`;
    div.innerHTML = content;
}

function computeMonthlyStats(player, year) {
    const div = document.getElementById('monthly-content');
    const monthlyTotals = [];
    for (let m = 1; m <= 12; m++) {
        const monthStr = m.toString().padStart(2, '0');
        const sum = data.filter(d => d.date.startsWith(`${year}-${monthStr}`)).reduce((s, d) => s + d[player], 0);
        monthlyTotals.push(sum);
    }
    const max = Math.max(...monthlyTotals);
    const min = Math.min(...monthlyTotals);
    const media = monthlyTotals.reduce((s, v) => s + v, 0) / 12;
    const mediana = median(monthlyTotals);
    const desviacion = stdDev(monthlyTotals);
    div.innerHTML = `
        <p><span class="stat-label">Max:</span> <span class="stat-value">${max}</span></p>
        <p><span class="stat-label">Min:</span> <span class="stat-value">${min}</span></p>
        <p><span class="stat-label">Media:</span> <span class="stat-value">${media.toFixed(2)}</span></p>
        <p><span class="stat-label">Mediana:</span> <span class="stat-value">${mediana}</span></p>
        <p><span class="stat-label">Desviación:</span> <span class="stat-value">${desviacion.toFixed(2)}</span> (<span class="stat-value">${((desviacion / media) * 100).toFixed(2)}%</span>)</p>
    `;
}

function computeStreaks(player, year) {
    const div = document.getElementById('streaks-content');
    const playerData = data.filter(d => d.date.startsWith(year)).map(d => d[player]);
    const differences = [];
    for (let i = 1; i < playerData.length; i++) {
        differences.push(playerData[i] - playerData[i-1]);
    }
    const masQueAnterior = differences.filter(d => d > 0).length;
    const menosQueAnterior = differences.filter(d => d < 0).length;
    const igualQueAnterior = differences.filter(d => d === 0).length;
    const mediaDif = differences.reduce((s, v) => s + v, 0) / differences.length;
    const medianaDif = median(differences);
    const modaDif = mode(differences);
    const maxStreakDrinking = maxConsecutive(playerData.map(v => v > 0));
    const maxStreakNot = maxConsecutive(playerData.map(v => v === 0));
    const totalBebiendo = playerData.filter(v => v > 0).length;
    const totalSin = playerData.filter(v => v === 0).length;
    const cantidadModa = mode(playerData);
    const diasModa = playerData.filter(v => v === cantidadModa).length;
    div.innerHTML = `
        <p><span class="stat-label">Dias más que el anterior:</span> <span class="stat-value">${masQueAnterior}</span></p>
        <p><span class="stat-label">Dias menos que el anterior:</span> <span class="stat-value">${menosQueAnterior}</span></p>
        <p><span class="stat-label">Dias igual que anterior:</span> <span class="stat-value">${igualQueAnterior}</span></p>
        <p><span class="stat-label">Media diferencia:</span> <span class="stat-value">${mediaDif.toFixed(2)}</span></p>
        <p><span class="stat-label">Mediana diferencia:</span> <span class="stat-value">${medianaDif}</span></p>
        <p><span class="stat-label">Moda diferencia:</span> <span class="stat-value">${modaDif}</span></p>
        <p><span class="stat-label">Mas días seguidos bebiendo:</span> <span class="stat-value">${maxStreakDrinking}</span></p>
        <p><span class="stat-label">Más días seguidos sin beber:</span> <span class="stat-value">${maxStreakNot}</span></p>
        <p><span class="stat-label">Total dias bebiendo:</span> <span class="stat-value">${totalBebiendo}</span></p>
        <p><span class="stat-label">Total dias sin beber:</span> <span class="stat-value">${totalSin}</span></p>
        <p><span class="stat-label">Cantidad de moda:</span> <span class="stat-value">${cantidadModa}</span></p>
        <p><span class="stat-label">Días bebiendo en la moda:</span> <span class="stat-value">${diasModa}</span></p>
    `;
}

function computeRelativeRankings(player, year) {
    const div = document.getElementById('relative-content');
    const yearData = data.filter(d => d.date.startsWith(year));
    const totalAnual = yearData.reduce((s, d) => s + d.CFC + d.JCR + d.JSP + d.DMP + d.DSS, 0);
    const playerTotal = yearData.reduce((s, d) => s + d[player], 0);
    const porcentaje = (playerTotal / totalAnual) * 100;
    const playerTotals = players.map(p => yearData.reduce((s, d) => s + d[p], 0)).sort((a, b) => b - a);
    const posicion = playerTotals.indexOf(playerTotal) + 1;
    const dailyRanks = yearData.map(d => {
        const dayScores = players.map(p => d[p]).sort((a, b) => b - a);
        return dayScores.indexOf(d[player]) + 1;
    });
    const posicionMedia = dailyRanks.reduce((s, v) => s + v, 0) / dailyRanks.length;
    const posicionMediana = median(dailyRanks);
    const posicionModa = mode(dailyRanks);
    const diasMas = yearData.filter(d => d[player] === Math.max(...players.map(p => d[p]))).length;
    const diasMenos = yearData.filter(d => d[player] === Math.min(...players.map(p => d[p]))).length;
    div.innerHTML = `
        <p><span class="stat-label">En porcentaje:</span> <span class="stat-value">${porcentaje.toFixed(2)}%</span></p>
        <p><span class="stat-label">Posición global:</span> <span class="stat-value">${posicion}</span></p>
        <p><span class="stat-label">Posición media:</span> <span class="stat-value">${posicionMedia.toFixed(2)}</span></p>
        <p><span class="stat-label">Posición mediana:</span> <span class="stat-value">${posicionMediana}</span></p>
        <p><span class="stat-label">Posición de moda:</span> <span class="stat-value">${posicionModa}</span></p>
        <p><span class="stat-label">Días siendo el que más:</span> <span class="stat-value">${diasMas}</span></p>
        <p><span class="stat-label">Días siendo el que menos:</span> <span class="stat-value">${diasMenos}</span></p>
    `;
}

function computeWeekdays(player, year) {
    const div = document.getElementById('weekdays-content');
    const yearData = data.filter(d => d.date.startsWith(year));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayTotals = dayNames.map(() => 0);
    const dayCounts = dayNames.map(() => 0);
    yearData.forEach(d => {
        const date = new Date(d.date);
        const day = date.getDay();
        dayTotals[day] += d[player];
        dayCounts[day]++;
    });
    const favoriteDay = dayTotals.indexOf(Math.max(...dayTotals));
    const con = dayTotals[favoriteDay];
    const media = con / dayCounts[favoriteDay];
    const porcentaje = (con / yearData.reduce((s, d) => s + d[player], 0)) * 100;
    div.innerHTML = `
        <p><span class="stat-label">Día favorito:</span> <span class="stat-value">${dayNames[favoriteDay]}</span></p>
        <p><span class="stat-label">Con:</span> <span class="stat-value">${con}</span></p>
        <p><span class="stat-label">Media:</span> <span class="stat-value">${media.toFixed(2)}</span></p>
        <p><span class="stat-label">Porcentaje:</span> <span class="stat-value">${porcentaje.toFixed(2)}%</span></p>
    `;
}

function computeMonthlyTrends(player, year) {
    const div = document.getElementById('trends-content');
    const monthlyRanks = [];
    const monthlyTotals = [];
    for (let m = 1; m <= 12; m++) {
        const monthStr = m.toString().padStart(2, '0');
        const monthData = data.filter(d => d.date.startsWith(`${year}-${monthStr}`));
        if (monthData.length > 0) {
            const playerTotals = players.map(p => monthData.reduce((s, d) => s + d[p], 0));
            const sortedTotals = [...playerTotals].sort((a, b) => b - a);
            const rank = sortedTotals.indexOf(playerTotals[players.indexOf(player)]) + 1;
            monthlyRanks.push(rank);
            monthlyTotals.push(playerTotals[players.indexOf(player)]);
        }
    }
    const mesesMas = monthlyRanks.filter(r => r === 1).length;
    const mesesMenos = monthlyRanks.filter(r => r === 5).length; // assuming 5 players
    const mediaPosicion = monthlyRanks.reduce((s, v) => s + v, 0) / monthlyRanks.length;
    const posicionModa = mode(monthlyRanks);
    const posicionMediana = median(monthlyRanks);
    const desviacion = stdDev(monthlyRanks);
    const strongestMonthIndex = monthlyTotals.indexOf(Math.max(...monthlyTotals));
    const strongestMonth = (strongestMonthIndex + 1).toString().padStart(2, '0');
    const strongestData = data.filter(d => d.date.startsWith(`${year}-${strongestMonth}`)).map(d => d[player]);
    const mediaDiariaFuerte = strongestData.reduce((s, v) => s + v, 0) / strongestData.length;
    const mediaDiariaFuerteSinCeros = strongestData.filter(v => v > 0).reduce((s, v) => s + v, 0) / strongestData.filter(v => v > 0).length;
    const mediaCerosPorMes = (365 - data.filter(d => d.date.startsWith(year)).filter(d => d[player] > 0).length) / 12; // approx
    const mediaDiasBebiendoPorMes = data.filter(d => d.date.startsWith(year)).filter(d => d[player] > 0).length / 12;
    div.innerHTML = `
        <p><span class="stat-label">Meses bebiendo el que más:</span> <span class="stat-value">${mesesMas}</span></p>
        <p><span class="stat-label">Meses bebiendo el que menos:</span> <span class="stat-value">${mesesMenos}</span></p>
        <p><span class="stat-label">Media de posición en el mes:</span> <span class="stat-value">${mediaPosicion.toFixed(2)}</span></p>
        <p><span class="stat-label">Posición de moda en el mes:</span> <span class="stat-value">${posicionModa}</span></p>
        <p><span class="stat-label">Posición mediana en el mes:</span> <span class="stat-value">${posicionMediana}</span></p>
        <p><span class="stat-label">Desviacion:</span> <span class="stat-value">${desviacion.toFixed(2)}</span></p>
        <p><span class="stat-label">Media diaria en el mes más fuerte:</span> <span class="stat-value">${mediaDiariaFuerte.toFixed(2)}</span></p>
        <p><span class="stat-label">Media diaria sin ceros en el mes más fuerte:</span> <span class="stat-value">${mediaDiariaFuerteSinCeros.toFixed(2)}</span></p>
        <p><span class="stat-label">Media de ceros por mes:</span> <span class="stat-value">${mediaCerosPorMes.toFixed(2)}</span></p>
        <p><span class="stat-label">Media de dias bebiendo por mes:</span> <span class="stat-value">${mediaDiasBebiendoPorMes.toFixed(2)}</span></p>
    `;
}

function computeHighConsumption(player, year) {
    const div = document.getElementById('high-content');
    const playerData = data.filter(d => d.date.startsWith(year)).map(d => d[player]);
    const rachaMasLarga = maxConsecutive(playerData.map(v => v >= 10));
    div.innerHTML = `<p><span class="stat-label">Racha más larga bebiendo 2 dígitos:</span> <span class="stat-value">${rachaMasLarga}</span></p>`;
}

function computeHistoricalStreaks(player) {
    const div = document.getElementById('historical-content');
    const allTotals = years.map(y => data.filter(d => d.date.startsWith(y)).reduce((s, d) => s + d[player], 0));
    const maxHistorico = Math.max(...allTotals);
    div.innerHTML = `<p><span class="stat-label">Máximo histórico actual:</span> <span class="stat-value">${maxHistorico}</span></p>`;
}

function computeTopDays(year) {
    const div = document.getElementById('topdays-content');
    const yearData = data.filter(d => d.date.startsWith(year));
    const dayTotals = yearData.map(d => ({ date: d.date, total: d.CFC + d.JCR + d.JSP + d.DMP + d.DSS })).sort((a, b) => b.total - a.total);
    const top3 = dayTotals.slice(0, 3);
    div.innerHTML = top3.map(d => `<p><span class="stat-label">${d.date}:</span> <span class="stat-value">${d.total}</span></p>`).join('');
}

// Utility functions
function median(arr) {
    if (arr.length === 0) return 0;
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
}

function stdDev(arr) {
    const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
    return Math.sqrt(arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length);
}

function mode(arr) {
    const freq = {};
    arr.forEach(v => freq[v] = (freq[v] || 0) + 1);
    return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
}

function maxConsecutive(arr) {
    let max = 0, current = 0;
    arr.forEach(v => {
        if (v) current++;
        else current = 0;
        if (current > max) max = current;
    });
    return max;
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadData);
