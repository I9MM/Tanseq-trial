function calculateRank() {
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

    if (score < 0 || score > 320) {
        resultDiv.innerHTML = '<div class="error">الدرجة يجب أن تكون بين 0 و320</div>';
        resultDiv.style.display = 'block';
        return;
    }

    let rank = null;
    for (let s in ranks2025) {
        if (Math.abs(score - s) < 0.01) {
            rank = ranks2025[s];
            break;
        }
        if (score > s) {
            rank = interpolateRank(score, s);
            break;
        }
    }

    if (!rank) {
        resultDiv.innerHTML = '<div class="error">لا توجد بيانات لهذه الدرجة</div>';
        resultDiv.style.display = 'block';
        return;
    }

    const availableColleges = colleges2024.filter(c => c.type === section && score >= c.minScore);
    const groupedColleges = groupByFaculty(availableColleges);

    resultDiv.innerHTML = `
        <div class="rank-info">
            <h3>نتيجتك</h3>
            <p>درجتك: ${score} (${rank.percent.toFixed(2)}%)</p>
            <p>ترتيبك: ${rank[section]}</p>
        </div>
        <div class="colleges-section">
            <h3>الكليات المتاحة</h3>
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

function interpolateRank(score, lowerScore) {
    const lower = ranks2025[lowerScore];
    const higherScore = parseFloat(lowerScore) + 0.5;
    const higher = ranks2025[higherScore] || lower;
    const fraction = (score - lowerScore) / 0.5;
    return {
        علوم: Math.round(lower.علوم + fraction * (higher.علوم - lower.علوم)),
        رياضة: Math.round(lower.رياضة + fraction * (higher.رياضة - lower.رياضة)),
        أدبي: Math.round(lower.أدبي + fraction * (higher.أدبي - lower.أدبي)),
        percent: lower.percent + fraction * (higher.percent - lower.percent)
    };
}

function groupByFaculty(colleges) {
    return colleges.reduce((acc, college) => {
        acc[college.faculty] = acc[college.faculty] || [];
        acc[college.faculty].push(college);
        return acc;
    }, {});
}