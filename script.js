function compareRanks() {
    const score = parseFloat(document.getElementById('score').value);
    const section = document.getElementById('section').value;
    const resultDiv = document.getElementById('result');

    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';

    if (!score || !section) {
        resultDiv.innerHTML = '<div class="error">يرجى إدخال الدرجة والشعبة</div>';
        resultDiv.style.display = 'block';
        return;
    }

    if (score < 160 || score > 320) {
        resultDiv.innerHTML = '<div class="error">الدرجة يجب أن تكون بين 250 و320</div>';
        resultDiv.style.display = 'block';
        return;
    }

    const rank2025 = interpolateRank2025(score, section);
    const rank2024 = interpolateRank2024(score, section);
    const availableColleges = colleges2024.filter(c => c.type === section && score >= c.minScore);
    const groupedColleges = groupByFaculty(availableColleges);

    resultDiv.innerHTML = `
        <div class="rank-info">
            <h3>نتيجتك</h3>
            <p>درجتك: ${score} (${rank2025.percent.toFixed(2)}%)</p>
            <p>ترتيبك 2025: ${rank2025[section]}</p>
            <p>ترتيبك 2024 (تقريبي): ${rank2024[section]}</p>
            <p>الفرق في الترتيب: ${rank2024[section] - rank2025[section]}</p>
        </div>
        <div class="colleges-section">
            <h3>الكليات المتاحة في 2024</h3>
            ${Object.keys(groupedColleges).map(faculty => `
                <div class="faculty-group">
                    <h4>${faculty} (الحد الأدنى: ${Math.min(...groupedColleges[faculty].map(c => c.minScore)).toFixed(2)})</h4>
                    ${groupedColleges[faculty].map(c => `
                        <div class="college-item">
                            <div class="college-name">${c.name}</div>
                            <div class="college-score">الحد الأدنى: ${c.minScore} (${c.percent.toFixed(2)}%)</div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
    resultDiv.style.display = 'block';
}

function interpolateRank2025(score, section) {
    let lowerScore = Math.floor(score * 2) / 2;
    let higherScore = Math.ceil(score * 2) / 2;
    let lower = ranks2025[lowerScore] || ranks2025[lowerScore - 0.5];
    let higher = ranks2025[higherScore] || lower;

    const fraction = (score - lowerScore) / 0.5;
    return {
        [section]: Math.round(lower[section] + fraction * (higher[section] - lower[section])),
        percent: lower.percent + fraction * (higher.percent - lower.percent)
    };
}

function interpolateRank2024(score, section) {
    // تقريب بسيط بناءً على نسبة 2024
    const baseRank = colleges2024.find(c => c.type === section && c.minScore <= score);
    if (!baseRank) return { [section]: 0, percent: 0 };
    const percent = baseRank.percent + ((score - baseRank.minScore) / (320 - baseRank.minScore)) * (100 - baseRank.percent);
    return { [section]: Math.round((320 - score) * 1000), percent: percent };
}

function groupByFaculty(colleges) {
    return colleges.reduce((acc, college) => {
        acc[college.faculty] = acc[college.faculty] || [];
        acc[college.faculty].push(college);
        return acc;
    }, {});
}
