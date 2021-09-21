const langEl = document.querySelector(".langWrap") ;
const link = document.querySelectorAll("a") ;
const titleEl = document.querySelector(".newTitle") ;
const descrEl = document.querySelector(".description") ;
const headEl = document.querySelector(".newHead") ;

link.forEach(el => {
    el.addEventListener('click', () => {
        langEl.querySelector('.newActive').classList.remove('newActive') ;
        el.classList.add('newActive') ;

        const attr = el.getAttribute('language') ;

        titleEl.textContent = data1[attr].title ;
        descrEl.textContent = data1[attr].description ;
        headEl.textContent = head[attr] ;
    })
})

var head = {
    "english": "About Vaccination",
    "arabic": "عن التطعيم"
}

var data1 = {
    "english": {
        "title": "What are the benefits of getting vaccinated?",
        "description": " The COVID-19 vaccines produce protection against the disease, as a result of developing an immune response to the SARS-Cov-2 virus. Developing immunity through vaccination means there is a reduced risk of developing the illness and its consequences. This immunity helps you fight the virus if   exposed. Getting vaccinated may also protect people around you, because if you are protected from  getting infected and from disease, you are less likely to infect someone else. This is particularly  important to protect people at increased risk for severe illness from COVID-19, such as healthcare  providers, older or elderly adults, and people with other medical conditions.",
    },
    "arabic": {
        "title": "ما هي فوائد التطعيم؟",
        "description": " تنتج لقاحات COVID-19 حماية ضد المرض ، نتيجة لتنمية المناعة الاستجابة لفيروس SARS-Cov-2. تطوير المناعة من خلال التطعيم يعني أن هناك انخفاضًا خطر الإصابة بالمرض وعواقبه. هذه المناعة تساعدك على محاربة الفيروس إذا مكشوف. قد يؤدي التطعيم أيضًا إلى حماية الأشخاص من حولك ، لأنه إذا كنت محميًا من الإصابة بالعدوى ومن المرض ، من غير المرجح أن تصيب شخصًا آخر. هذا بشكل خاص مهم لحماية الأشخاص المعرضين لخطر متزايد للإصابة بأمراض خطيرة من COVID-19 ، مثل الرعاية الصحية مقدمي الخدمات ، وكبار السن أو كبار السن ، والأشخاص الذين يعانون من حالات طبية أخرى."
    }

}