from_coin = 'BAN';
to_coin = 'XNO';
to_rate = 0;
cancel = false;
coins = {}
swap_id = "";

fetch(`https://fluffyswap.com/rates/${from_coin}?to=${to_coin}`)
    .then((response) => response.json())
    .then((data) => {
        if (from_coin == "DUCO" || from_coin == "XMG") to_rate = round_to(10, data["result"]);
        else to_rate = round_to(6, data["result"]);
        $("#exchange_rate").html(
            `1 ${from_coin} = ${to_rate} ${to_coin}`);
    });

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        if (Math.floor(interval) == 1) {
            return Math.floor(interval) + " year";
        }
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        if (Math.floor(interval) == 1) {
            return Math.floor(interval) + " month";
        }
        return Math.floor(interval) + " months";
    }
    /*interval = seconds / 86400;
     if (interval > 1) {
       if (Math.floor(interval) == 1) {
         return Math.floor(interval) + " day";
       }
       return Math.floor(interval) + " days";
     }*/
    interval = seconds / 3600;
    if (interval > 1) {
        if (Math.floor(interval) == 1) {
            return Math.floor(interval) + "h";
        }
        return Math.floor(interval) + "h";
    }
    interval = seconds / 60;
    if (interval > 1) {
        if (Math.floor(interval) == 1) {
            return Math.floor(interval) + " min";
        }
        return Math.floor(interval) + " mins";
    }
    return Math.floor(seconds) + " secs";
}
var aDay = 24 * 60 * 60 * 1000;

fetch(`https://fluffyswap.com/recent_swaps`)
    .then((response) => response.json())
    .then((data) => {
        final_html = "";
        i = 0;
        for (swap in data.result.reverse()) {
            final_html += `
                <li>
                    ${timeSince(data.result[swap]["time"]*1000)} ago:
                    <b><span class="accent">${round_to(5, data.result[swap]["initial"])}</span> <img class="icon is-small" src="/icons/${data.result[swap]["from_coin"].toLowerCase()}.png"></b> to
                    <b><span class="accent">${round_to(5, data.result[swap]["exchanged"])}</span> <img class="icon is-small" src="/icons/${data.result[swap]["to_coin"].toLowerCase()}.png"></b>
                    <a href="${data.result[swap]["link"]}" target="_blank">
                        <i class="fa fa-external-link"></i>
                    </a> 
            `
            i += 1;
            if (i > 10) break;
        }
        $("#recent_swaps").html(final_html)
    });

other_coins = ["XMG", "DUCO", "XNO", "BAN"]

function round_to(precision, value) {
    power_of_ten = 10 ** precision;
    return Math.round(value * power_of_ten) / power_of_ten;
}

function set_from(coin) {
    from_coin = coin;
    $("#modal-from").removeClass("is-active");
    document.getElementsByTagName('html')[0].style.overflow = ""
    document.getElementsByTagName('body')[0].style.overflowY = "";
    $("#from_icon").attr('src', `/icons/${coin.toLowerCase()}.png`);
    $("#from_symbol").html(coin);
    $("#from_name").html(coins[coin]["name"]);

    if (from_coin != to_coin) {
        fetch(`https://fluffyswap.com/rates/${from_coin}?to=${to_coin}`)
            .then((response) => response.json())
            .then((data) => {
                if (from_coin == "DUCO" || from_coin == "XMG") to_rate = round_to(10, data["result"]);
                else to_rate = round_to(6, data["result"]);
                $("#exchange_rate").html(
                    `1 ${from_coin} = ${to_rate} ${to_coin}`);
            });
    } else {
        $("#exchange_rate").html(
            `1 ${from_coin} = 0.99 ${to_coin}`);
    }
}


function set_to(coin) {
    to_coin = coin;
    $("#modal-to").removeClass("is-active");
    $("#modal-from").removeClass("is-active");
    document.getElementsByTagName('html')[0].style.overflow = ""
    document.getElementsByTagName('body')[0].style.overflowY = "";
    $("#to_icon").attr('src', `/icons/${coin.toLowerCase()}.png`);
    $("#to_symbol").html(coin);
    $("#to_name").html(coins[coin]["name"]);
    $("#receiving_label").html(`Your <b>${coins[coin]["name"]}</b> address`)
    $("#address_input").attr("placeholder", `Receiving ${coin} wallet`)

    if (from_coin != to_coin) {
        fetch(`https://fluffyswap.com/rates/${from_coin}?to=${to_coin}`)
            .then((response) => response.json())
            .then((data) => {
                if (from_coin == "DUCO" || from_coin == "XMG") to_rate = round_to(10, data["result"]);
                else to_rate = round_to(6, data["result"]);
                $("#exchange_rate").html(
                    `1 ${from_coin} = ${to_rate} ${to_coin}`);
            });
    } else {
        $("#exchange_rate").html(
            `1 ${from_coin} = 0.99 ${to_coin}`);
    }
}

document.querySelector('#swap_button').addEventListener('click', function(event) {
    event.preventDefault();
});


$("#swap_button").click(function() {
    address = $("#address_input").val();

    create_a_swap = false;

    if (to_coin == "DUCO") {
        $.getJSON(`https://server.duinocoin.com/balances/${address}`,
            function(data) {
                if (!data.success) {
                    alert("Incorrect Duino-Coin username provided! Keep in mind it's case sensitive!");
                }
                else {
                    create_swap(address);
                    return;
                }
            });
    } else if (to_coin == "XMG") {
        if (address.length == 34 && address.startsWith("9")) create_a_swap = true;
        else alert("Incorrect Coin Magi address provided! It should be 34 characters long and start with 9!");
    } else if (to_coin == "BAN") {
        if (address.startsWith("ban_")) create_a_swap = true;
        else alert("Incorrect Banano address provided! It should start with ban!");
    } else if (to_coin == "XNO") {
        if (address.startsWith("nano_")) create_a_swap = true;
        else alert("Incorrect NANO address provided! It should start with nano!");
    } else {
        create_a_swap = true;
    }

    if (create_a_swap) create_swap(address);
    return;
});


function create_swap(address) {
    $("#swap_button").addClass("is-loading");
    $.getJSON('https://fluffyswap.com/create_swap' +
        `?from=${from_coin}` +
        `&to=${to_coin}` +
        `&address=${address}`,
        function(data) {
            $("#swap_button").removeClass("is-loading");
            if (data.success) {
                $("#step1").fadeOut('fast', function() {
                    $("#step2").fadeIn('fast');
                });
                swap_id = data.result.id;
                console.log(`Swap ID: ${swap_id}`);
                check_swap(swap_id);
                $("#order").html(swap_id);
                $(".from_coin").html(from_coin);
                $(".to_coin").html(to_coin);
            } else {
                alert(data.message);
            }
        });
}


function cancel_swap() {
    $("#cancel_button").addClass("is-loading");
    $.getJSON(`https://fluffyswap.com/cancel_swap?order=${swap_id}`,
        function(data) {
            $("#cancel_button").removeClass("is-loading")
            if (data.success) {
                $("#prepared").fadeOut('fast', function() {
                    $("#sending").fadeOut('fast', function() {
                        $("#done").fadeOut('fast', function() {
                            cancel = true;
                            $("#cancelled").fadeIn('fast');
                        });
                    });
                });
            } else {
                alert(data.message);
            }
        });
}

send_addr = "";

function check_swap(swap_id) {
    if (cancel) return;
    $.getJSON(`https://fluffyswap.com/swap_status?id=${swap_id}`,
            function(data) {
                if (data.success) {
                    if (data.result.status == "wait") {
                        $("#preparing").fadeOut('fast', function() {
                            $("#prepared").fadeIn('fast');
                        });
                        send_addr = data.result.send;
                        if (from_coin == "DUCO") {
                            $("#send_address").val(
                                `"coinexchange" with memo: ${send_addr}`);
                        } else if (from_coin == "XMG") {
                            $("#send_address").val(
                                `"revox" with memo: ${send_addr}`);
                        } else { $("#send_address").val(send_addr); }
                        $("#from_minimum").html(
                            `${data.result.min.toFixed(4)} ${from_coin}`)
                        $("#from_maximum").html(
                            `${data.result.max.toFixed(4)} ${from_coin}`)
                        if (data.result.max.toFixed(4) == 0 || data.result.max <= data.result.min) alert("Warning! This swap will likely fail, there is no liquidity for the resulting coin. Donate or perform a swap FROM the resulting coin");
                        if (from_coin == "XNO") { $("#xno_notice").fadeIn('fast'); }
                        if (to_coin == "XMG") { $("#xmg_notice").fadeIn('fast'); }
                    } else if (data.result.status == "sending") {
                        $("#prepared").fadeOut('fast', function() {
                            $("#sending").fadeIn('fast');
                            if (to_coin == "XMG") { $("#xmg_notice_2").fadeIn('fast') };
                        });
                    } else if (data.result.status == "finished") {
                        $("#txid").html(data.result.txid)
                        $("#txid_link").attr("href", data.result.link)
                        $("#prepared").fadeOut('fast', function() {
                            $("#sending").fadeOut('fast', function() {
                                $("#done").fadeIn('fast');
                            });
                        });
                    }
                }
                setTimeout(function() { check_swap(swap_id) }, 3000);
            })
        .fail(function() {
            setTimeout(function() { check_swap(swap_id) }, 3000);
        });
}

function copy_address() {
    copyTextToClipboard(send_addr);
    $("#copy_button").addClass("is-success");
    $("#copy_button").text("Done");
    setTimeout(function() {
        $("#copy_button").removeClass("is-success");
        $("#copy_button").text("Copy");
    }, 500)
}

setInterval(function() {
    $("#dots").html("..")
    setTimeout(function() { $("#dots").html("...") }, 500);
    setTimeout(function() { $("#dots").html(".") }, 1000);
}, 1500);

setInterval(function() {

    if ($("#address_input").val()) {
        if (!other_coins.includes(to_coin)) {
            prep_name = to_coin.toLowerCase();
            correct_address = WAValidator.validate(
                $("#address_input").val(), prep_name);
        } else correct_address = true;
        
        if (correct_address) {
            $("#incorrect_address").hide('fast');
            $("#address_input").removeClass("is-danger");
            $("#address_input").addClass("is-success");
            $("#swap_button").attr("disabled", false);
        } else {
            $("#address_input").removeClass("is-success");
            $("#address_input").addClass("is-danger");
            $("#incorrect_address").show('fast');
            $("#swap_button").attr("disabled", true);
        }
    } else {
        $("#address_input").removeClass("is-success");
        $("#address_input").removeClass("is-danger");
        $("#incorrect_address").hide('fast');
        $("#swap_button").attr("disabled", true);
    }

}, 350)

fetch('https://zapex-front.onrender.com/in_coins')
    .then((response) => response.json())
    .then((data) => {
        final_html = "";

        for (coin in data) {
            final_html += `
            <div class="column is-half-mobile is-one-third-desktop" style="min-width:200px">
                <div class="box buttonbox" style="cursor:pointer;" onclick="set_from('${coin}')">
                    <img src="/icons/${coin.toLowerCase()}.png">
                    <p class="title is-size-4">
                        ${coin}
                    </p>
                    <p class="subtitle">
                        ${data[coin]["name"]}
                    </p>
                </div>
            </div>
        `
        }

        final_html += `
            <div class="column is-full-mobile is-one-third-desktop" style="min-width:200px">
                <div class="box">
                    <p class="title is-size-4">
                        Need more?
                    </p>
                    <p class="subtitle">
                        Be sure to check in a few days, we'll be adding more coins soon!
                    </p>
                </div>
            </div>
        `
        $("#available_coins_from").html(final_html);

    });

fetch('https://zapex-front.onrender.com/out_coins')
    .then((response) => response.json())
    .then((data) => {
        coins = data;

        final_html = "";
        final_html = "";
        for (coin in data) {
            final_html += `
            <div class="column is-half-mobile is-one-third-desktop" style="min-width:200px">
                <div class="box buttonbox" style="cursor:pointer;" onclick="set_to('${coin}')">
                    <img src="/icons/${coin.toLowerCase()}.png">
                    <p class="title is-size-4">
                        ${coin}
                    </p>
                    <p class="subtitle">
                        ${data[coin]["name"]}
                    </p>
                </div>
            </div>
        `
        }
        final_html += `
            <div class="column is-full-mobile is-one-third-desktop" style="min-width:200px">
                <div class="box">
                    <p class="title is-size-4">
                        Need more?
                    </p>
                    <p class="subtitle">
                        Be sure to check in a few days, we'll be adding more coins soon!
                    </p>
                </div>
            </div>
        `
        $("#available_coins_to").html(final_html);

    }).catch((error) => {
        alert("Looks like there's maintenance going on. Try again in a few minutes")
    });


function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copy: ' + msg);
    } catch (err) {
        console.error('Fallback: Unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copied to clipboard!');
    }, function(err) {
        console.error('Async: Unable to copy', err);
    });
}

$(document).ready(function() {
    $("#pageloader").fadeOut();
})
