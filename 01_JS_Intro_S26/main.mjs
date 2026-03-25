import * as libFunctions from "./js/funcs.mjs";
import { fakerDE as faker } from 'https://cdn.skypack.dev/@faker-js/faker';

window.onload = () => {
    console.log("Window loaded", new Date().toLocaleTimeString());
    const listEle = document.getElementById("list");
    const searchInput = document.getElementById("search");
    searchInput.addEventListener("input", (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredItems = contentArray.filter(item => {
            const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
            return fullName.includes(searchTerm) || item.jobTitle.toLowerCase().includes(searchTerm);
        });
        renderList(filteredItems);
    });

    const contentArray = [];
    for (let i = 0; i < 15; ++i) {
        const sex = faker.person.sexType({ includeGeneric: false });
        contentArray.push({
            sex,
            firstName: faker.person.firstName(sex),
            lastName: faker.person.lastName(),
            jobTitle: faker.person.jobTitle(),
            image: faker.image.personPortrait({ size: '64' })
        });
    }

    function renderList(contentArray) {
        libFunctions.removeAllChildren(listEle);
        for (const item of contentArray) {
            const itemEle = libFunctions.dom("div", { class: "box" },
                libFunctions.dom("h2", {}, `${item.firstName} ${item.lastName}`),
                libFunctions.dom("p", {}, item.jobTitle),
                libFunctions.dom("img", { src: item.image, alt: "Image" })
            );
            listEle.appendChild(itemEle);
        }
    }

    renderList(contentArray);
};
