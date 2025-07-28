document.getElementById('calculator-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const score = parseFloat(document.getElementById('score').value);
    const track = document.getElementById('track').value;
    const resultDiv = document.getElementById('result');

    // Validate input
    if (isNaN(score) || score < 0 || score > 320) {
        resultDiv.innerHTML = '<p style="color: red;">يرجى إدخال درجة صحيحة بين 0 و320</p>';
        resultDiv.style.display = 'block';
        return;
    }

    if (!track) {
        resultDiv.innerHTML = '<p style="color: red;">يرجى اختيار الشعبة</p>';
        resultDiv.style.display = 'block';
        return;
    }

    // Calculate percentage (2025 scale: out of 320)
    const percentage = (score / 320) * 100;
    // Convert to 2024 equivalent score (out of 410)
    const equivalentScore = (percentage / 100) * 410;

    // Approximate rank (linear model, higher score = lower rank)
    const maxRank = 100000; // Assume 100,000 students
    const minScore = 250;
    const maxScore = 320;
    let rank;
    if (score < minScore) {
        rank = 'غير متاح (الدرجة أقل من 250)';
    } else {
        rank = Math.round(maxRank - ((score - minScore) / (maxScore - minScore)) * (maxRank - 1));
    }

    // College thresholds based on 2024 (410 scale), converted to 320 scale
    const colleges = {
        science: [
            { min410: 369, min320: (369/410) * 320, name: 'الطب، طب الأسنان، الصيدلة' }, // ~288/320
            { min410: 356, min320: (356/410) * 320, name: 'الصيدلة، العلاج الطبيعي' }, // ~278/320
            { min410: 344, min320: (344/410) * 320, name: 'الهندسة، العلوم' }, // ~268/320
            { min410: 328, min320: (328/410) * 320, name: 'العلوم، التمريض' }, // ~256/320
            { min410: 315, min320: (315/410) * 320, name: 'التمريض، الزراعة' } // ~246/320
        ],
        math: [
            { min410: 344, min320: (344/410) * 320, name: 'الهندسة، الحاسبات والمعلومات' }, // ~268/320
            { min410: 328, min320: (328/410) * 320, name: 'الحاسبات والمعلومات، العلوم' }, // ~256/320
            { min410: 315, min320: (315/410) * 320, name: 'العلوم، التجارة' } // ~246/320
        ],
        literary: [
            { min410: 336, min320: (336/410) * 320, name: 'الحقوق، الآداب' }, // ~262/320
            { min410: 320, min320: (320/410) * 320, name: 'الآداب، التجارة' }, // ~250/320
            { min410: 305, min320: (305/410) * 320, name: 'التجارة، التربية' } // ~238/320
        ]
    };

    // Get available colleges
    let availableColleges = colleges[track]
        .filter(college => score >= college.min320)
        .map(college => college.name);
    if (score < 238) { // Lowest threshold (~305/410 for literary)
        availableColleges = ['لا توجد كليات متاحة في النطاق الحالي (238-320)'];
    } else if (availableColleges.length === 0) {
        availableColleges = ['لا توجد كليات متاحة لهذه الدرجة في الشعبة المختارة'];
    }

    // Display result
    resultDiv.innerHTML = `
        <h3>النتيجة:</h3>
        <p><strong>درجتك (2025):</strong> ${score} من 320</p>
        <p><strong>النسبة المئوية:</strong> ${percentage.toFixed(2)}%</p>
        <p><strong>الدرجة المكافئة (2024):</strong> ${equivalentScore.toFixed(2)} من 410</p>
        <p><strong>الترتيب التقريبي:</strong> ${rank}</p>
        <p><strong>الكليات المتاحة:</strong> ${availableColleges.join('، ')}</p>
    `;
    resultDiv.style.display = 'block';
});
