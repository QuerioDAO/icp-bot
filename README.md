# Querio ICP Bot

Querio has successfully launched its frontend and search engine on the Internet Computer platform. However, in the current architecture, the Querio search engine retrieves data from a single instance of the crawler and scraper, lacking the decentralized approach we aspire to achieve.

ICP bot performs an automated crawl of the IC canisters, enabling the discovery of new or updated canisters based on their module hash. These findings are used to generate tasks that are actively sent to the content miner for inclusion in the task queue. On a daily basis, every 24 hours, the ICP bot thoroughly scans the entire Internet Computer network to identify any new or updated canisters. It's important to note that in the future, Querio will extend its support to various blockchains. This expansion means that dApps built on these blockchains will also become searchable through Querio. To achieve this, each blockchain will have its dedicated Querio bot, which will provide the content miners with a list of new or updated dApp URLs specific to that particular blockchain.

# Description
Querio team is building a new decentralized architecture for Querio's search engine, leveraging a network of content miners. This architecture comprises several components, including:

- Content miners
- ICP bot
- Content scrapers 
- Content validator

The Querio content miner plays a crucial role in the decentralized network, ensuring seamless communication with both the ICP Bot and Content Scraper instances. 
In this dynamic environment, the ICP Bot dispatches tasks to the Content Miner, specifying the content that requires scraping.
Meanwhile, the Content Scraper instances actively request tasks from the Content Miner, ensuring a smooth and efficient workflow. 
Once the tasks are assigned by the Content Miner, the Content Scraper instances diligently process them and return the updated content to the Content Miner. The Content Miner then handles the content for each new or updated dApp, subsequently forwarding it to the validator canister for further validation and processing.

<img width="1289" alt="Screenshot 2023-10-12 at 18 06 49" src="https://github.com/QuerioDAO/icp-bot/assets/91743348/8aeeeba2-de70-423e-b996-66aef35deb82">

# Components
1. Content miners
Within this decentralized network, every content miner maintains a cache containing all the scraped dApps and their relevant content information, including "url", "title", "heading", "icon_url", "data_hash", "data", "created_at" and "updated_at". This comprehensive cache ensures efficient access to the stored data for future use and reference.
During each cycle, the content miner checks the cache for dApps that have been updated within the current cycle based on the "updated_at" field. These dApps are then sent to the validator canister for validation.

2. ICP bot
The Querio bot performs an automated crawl of the IC canisters, enabling the discovery of new or updated canisters based on their module hash. These findings are used to generate tasks that are actively sent to the content miner for inclusion in the task queue.
On a daily basis, every 24 hours, the ICP bot thoroughly scans the entire Internet Computer network to identify any new or updated canisters.
It's important to note that in the future, Querio will extend its support to various blockchains. This expansion means that dApps built on these blockchains will also become searchable through Querio. To achieve this, each blockchain will have its dedicated Querio bot, which will provide the content miners with a list of new or updated dApp URLs specific to that particular blockchain.
 
3. Content scrapers
By default, a content miner will run four instances of the content scraper in parallel. However, this value can be manually increased according to the content miner's preference.
Each content scraper instance receives a task from the content miner, which entails scraping a specific dApp URL, processing its content, and subsequently returning it to the content miner. Once a task is completed, the content scraper promptly receives another task from the content miner, ensuring a seamless and continuous workflow
Content scrapers, operating under the content miner, are assigned tasks in the form of dApp URL and provide updated content in return. When receiving HTML content, the content scraper extracts clean text, computes its SHA256 hash, converts the text to base64, and sends it to the content miner. 
The content miner compares the new SHA256 hash with the existing one in the cache. If a match is found, the content is ignored. Otherwise, the content miner saves the new hash in the cache, updates the "updated_at" field, and stores the updated content. During each cycle, the content miner checks the cache for dApps that have been updated within the current cycle based on the "updated_at" field. These dApps are then sent to the validator canister for further processing.

4. Content validator 
The validator canister undertakes the crucial task of validating the new content received from the content miners. If the content is present in the majority of content miners, exceeding half of them, it is deemed valid and subsequently forwarded to the search engine for further processing. The validation process takes place at the end of each cycle.
The validator canister maintains knowledge of the list of miners through their principal IDs, ensuring accurate identification and verification during the validation process.
This validator canister possesses knowledge of and control over the intervals at which the content miners send content.
