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

                if (e.target.querySelector('select[name=counsel_time]').value === "") {
                    e.target.querySelector('select[name=counsel_time]').setCustomValidity('상담 시간을 선택해주세요.')

                } else {
                    postData("https://skshieldus.com/api/counsel/insert.do", value).then((res) => {
                        if (res.resultCode === '0000') {
                            if (e.target != document.querySelector('.reservation-form')) {
                                $(e.target.parentElement.querySelector('.w-form-done')).toggle()
                            } else {
                                $('.modal-wrapper').css({display: "flex"})
                                $('.bottom-sticky-success').css({display: "flex"})
                            }
                            if (e.target != document.querySelector('.reservation-form')) {
                                $(e.target).toggle()
                            }
                        } else {
                            // $(e.target.parentElement.querySelector('.error-message')).toggle()
                        }

                    }).catch(() => {
                        // $(e.target.parentElement.querySelector('.error-message')).toggle()

                        // if (e.target != document.querySelector('.reservation-form')) {
                        //     $(e.target).toggle()
                        // }
                    })
                }
                tc.ctaDisabled.value = true;
                return false;
            })
        })
    });
}

window.addEventListener('load', () => {
    disableDefaultFormSubmission()
    // setTimeout(() => document.querySelector('.w-webflow-badge').remove(), 100);

    document.querySelectorAll('input[name=name]').forEach((name) => {
        name.oninvalid = (e) => {
            if (e.target.validity.valueMissing) {
                e.target.setCustomValidity('이름을 입력해주세요.')
                return true
            } else {
                e.target.setCustomValidity('')
                if (document.querySelector('select[name=counsel_time]').value === "") {
                    e.target.form.querySelector('select[name=counsel_time]').setCustomValidity('상담 시간을 선택해주세요.')
                    return true
                }
            }

            return false
        }
        name.addEventListener('keyup', (e) => {
            const data = new FormData(e.target.form);
            const value = Object.fromEntries(data.entries());
            tc.ctaDisabled.value = !(value?.name && value?.phone && (value["counsel_time"].length > 0) && (value?.marketingUseYn === "on"));
        })
    })
    document.querySelectorAll('input[name=phone]').forEach((name) => {
        name.oninvalid = (e) => {
            if (e.target.validity.valueMissing) {
                e.target.setCustomValidity('연락처를 입력해주세요.')
                return true
            } else {
                e.target.setCustomValidity('')
                if (document.querySelector('select[name=counsel_time]').value === "") {
                    e.target.form.querySelector('select[name=counsel_time]').setCustomValidity('상담 시간을 선택해주세요.')
                    return true
                }
            }

            return false
        }
        name.addEventListener('keyup', (e) => {
            const data = new FormData(e.target.form);
            const value = Object.fromEntries(data.entries());
            tc.ctaDisabled.value = !(value?.name && value?.phone && (value["counsel_time"].length > 0) && (value?.marketingUseYn === "on"));
        })
    })
    document.querySelectorAll('select[name=counsel_time]').forEach((name) => {
        name.oninvalid = (e) => {
            if (e.target.validity.valueMissing) {
                e.target.setCustomValidity('상담 시간을 선택해주세요.')
            } else {
                e.target.setCustomValidity('')
            }

            return true
        }
        name.addEventListener('change', (e) => {
            const data = new FormData(e.target.form);
            const value = Object.fromEntries(data.entries());
            tc.ctaDisabled.value = !(value?.name && value?.phone && (value["counsel_time"].length > 0) && (value?.marketingUseYn === "on"));
        })
    })
    document.querySelectorAll('[name=marketingUseYn]').forEach((name) => {
        name.addEventListener('change', (e) => {
            const data = new FormData(e.target.form);
            const value = Object.fromEntries(data.entries());
            tc.ctaDisabled.value = !(value?.name && value?.phone && (value["counsel_time"].length > 0) && (value?.marketingUseYn === "on"));
        })
    })
})

