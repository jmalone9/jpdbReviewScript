// ==UserScript==
// @name         JPDB Review
// @namespace    https://jpdb.io
// @version      2.0
// @description  add a review menu to jpdb and hides english
// @author       Lotte
// @match        https://jpdb.io/deck?*
// @grant        none
// ==/UserScript==


    const createReviewMenu = (vid, sid) => `
                    <ul style="list-style-type: none; padding: 0; display: flex; gap: 5px; margin: 0px;">
                    <li style="display: inline;"><a style="color: red;" href="javascript:;" onclick="entryReview(1, '${vid}', '${sid}')">Nothing</a></li>
                    <li style="display: inline;"><a style="color: #ff3b3b;" href="javascript:;" onclick="entryReview(2, '${vid}', '${sid}')">Something</a></li>
                    <li style="display: inline;"><a style="color: #df6d2b;" href="javascript:;" onclick="entryReview(3, '${vid}', '${sid}')">Hard</a></li>
                    <li style="display: inline;"><a style="color: #4fa825;" href="javascript:;" onclick="entryReview(4, '${vid}', '${sid}')">Good</a></li>
                    <li style="display: inline;"><a style="color: #4b8dff;" href="javascript:;" onclick="entryReview(5, '${vid}', '${sid}')">Easy</a></li>
                </ul>
    `;

    var overdueElements = document.querySelectorAll('div.entry.overdue div div:last-of-type').forEach(entry => {
        entry.style.display = 'none';
    });
    /*var newElements = document.querySelectorAll('div.entry.new div div:last-of-type').forEach(entry => {
        entry.style.display = 'none';
    });*/
    var failedElements = document.querySelectorAll('div.entry.failed div div:last-of-type').forEach(entry => {
        entry.style.display = 'none';
    });

    // Iterate over each entry
    document.querySelectorAll(".entry.new, .entry.overdue, .entry.failed").forEach(entry => {
        // Retrieve 'v' and 's' values from hidden input fields
        const vid = entry.querySelector("form.link-like input[name='v']")?.value;
        const sid = entry.querySelector("form.link-like input[name='s']")?.value;

        // If both 'v' and 's' exist, create and append the review menu
        if (vid && sid) {

// Modify the insertion code to wrap everything in a container div
const containerHTML = `
    <div style="border: 1px solid var(--big-shadow-border); padding: 10px; border-radius: 18px; margin-bottom: 12px; box-shadow: 0 0 16px var(--big-shadow-color);">
        ${entry.outerHTML} <!-- This includes the existing entry -->
        <div>${createReviewMenu(vid, sid)}</div>
    </div>
`;

// Instead of inserting after the entry, you replace the entry with the container
entry.insertAdjacentHTML('afterend', containerHTML);
entry.remove(); // Remove the original entry


            // Define the review function for this specific entry
            window.entryReview = async (n, vid, sid) => {
                const response = await fetch(`https://jpdb.io/review?c=vf%2C${vid}%2C${sid}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        Accept: '*/*',
                    },
                });

                if (response.status >= 400) {
                    alert(`HTTP error ${response.statusText} while getting next review number for word ${vid}/${sid}`);
                    return; // Exit if there's an error
                }

                const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
                if (doc.querySelector('a[href="/login"]') !== null) {
                    alert(`You are not logged in to jpdb.io - Reviewing cards requires being logged in`);
                    return; // Exit if not logged in
                }

                const reviewNoInput = doc.querySelector('form[action^="/review"] input[type=hidden][name=r]');
                if (reviewNoInput == null) {
                    alert("Could not find review number. Please try again.");
                    return; // Exit if review number not found
                }

                const reviewNo = parseInt(reviewNoInput.value);

                const reviewResponse = await fetch('https://jpdb.io/review', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `c=vf%2C${vid}%2C${sid}&r=${reviewNo}&g=${n}`, // &force=true
                });
                if (reviewResponse.ok) {
                // Create success message
                const successMessage = document.createElement('li');
                successMessage.innerText = "✔";
                successMessage.style.color = "green"; // Optional: style it as needed

                 // Find the <li> for the Easy link
                 const easyLinkLi = document.querySelector('a[onclick="entryReview(5, \'' + vid + '\', \'' + sid + '\')"]').closest('li');

                 if (easyLinkLi) {
                     // Insert the success message after the <li> for Easy
                     easyLinkLi.insertAdjacentElement('afterend', successMessage);
                       }
                     //location.reload(); // Reload if the review was submitted successfully
                } else {
                    alert("Error submitting review.");
                }
            };
        }
    });