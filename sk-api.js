async function postData(url = "", data = {}) {
    // 옵션 기본 값은 *로 강조
    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE 등
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
    });
    return response.json(); // JSON 응답을 네이티브 JavaScript 객체로 파싱
}

function disableDefaultFormSubmission() {
    //
    Webflow.push(() => {
        const forms = [document.querySelector('.main-form'), document.querySelector('.estimate-form'), document.querySelector('.reservation-form')]
        forms.forEach(form => {
            $(form).submit((e) => {
                e.preventDefault()
                const data = new FormData(e.target);
                // Do a bit of work to convert the entries to a plain JS object
                const value = Object.fromEntries(data.entries());
                value.marketingUseYn = value?.marketingUseYn === "on" ? "Y" : "N"
                value.marketingCollectYn = value?.marketingCollectYn === "on" ? "Y" : "N"
                postData("https://dev.skshieldus.com/api/counsel/insert.do", value).then((res) => {
                    if (res.resultCode === '0000') {
                        $(e.target.parentElement.querySelector('.w-form-done')).toggle()
                    } else {
                        $(e.target.parentElement.querySelector('.error-message')).toggle()
                    }
                    $(e.target).toggle()
                }).catch(() => {
                    $(e.target.parentElement.querySelector('.error-message')).toggle()
                    $(e.target).toggle()
                })

                return false;
            })
        })
    });
}

window.addEventListener('load', () => {
    disableDefaultFormSubmission()
})