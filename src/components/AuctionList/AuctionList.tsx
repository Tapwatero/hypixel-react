import React, { useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../api/ApiHelper';
import { getLoadingElement } from '../../utils/LoadingUtils';
import { numberWithThousandsSeperators } from '../../utils/NumberFormatter';
import './AuctionList.css';
import { useHistory } from "react-router-dom";

interface Props {
    playerUUID: string
}

function AuctionList(props: Props) {

    let history = useHistory();

    let [auctions, setAuctions] = useState<Auction[]>([]);
    let [allAuctionsLoaded, setAllAuctinosLoaded] = useState(false);

    useEffect(() => {
        loadNewAuctions(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.playerUUID]);

    let loadNewAuctions = (reset?: boolean): void => {
        api.getAuctions(props.playerUUID, 20, reset ? 0 : auctions.length).then(newAuctions => {

            if (newAuctions.length < 20) {
                setAllAuctinosLoaded(true);
            }

            auctions = reset ? newAuctions : auctions.concat(newAuctions);

            newAuctions.forEach(auction => {
                loadItemImage(auction.item, auction.uuid, auctions);
            })
            setAuctions(auctions);
        })
    }

    let loadItemImage = (item: Item, auctionUUID: string, auctions: Auction[]): void => {
        api.getItemImageUrl(item).then((iconUrl => {
            let updatedAuctions = auctions.slice();
            let auction = updatedAuctions.find(a => a.uuid === auctionUUID);
            if (auction) {
                auction.item.iconUrl = iconUrl;
            }
            setAuctions(updatedAuctions);
        }));;
    }

    let getCoinImage = () => {
        return (
            <img src="/Coin.png" height="35px" width="35px" alt="" />
        );
    }

    let getItemImageElement = (auction: Auction) => {
        return (
            auction.item.iconUrl ? <img className="auction-item-image" src={auction.item.iconUrl} alt="" height="48" width="48" onError={(error) => onImageLoadError(auction, error)} /> : undefined
        )
    }

    let onImageLoadError = (auction: Auction, data: any) => {
        // todo, something to find the image
        console.log(data);
        console.log(auction.item);
    }

    let onAuctionClick = (auction: Auction) => {
        history.push({
            pathname: `/auction/${auction.uuid}`
        })
    }

    let auctionList = auctions.map(auction => {
        return (
            <ListGroup.Item key={auction.uuid} action onClick={() => { onAuctionClick(auction) }}>
                <h4>
                    {
                        getItemImageElement(auction)
                    }
                    {auction.item.name}
                </h4>
                <p>Highest Bid: {numberWithThousandsSeperators(auction.highestBid)} {getCoinImage()}</p>
                <p>End of Auction: {auction.end.toLocaleTimeString() + " " + auction.end.toLocaleDateString()}</p>
            </ListGroup.Item>
        )
    });

    return (
        <div className="auction-list">
            <InfiniteScroll style={{ overflow: "hidden" }} dataLength={auctions.length} next={loadNewAuctions} hasMore={!allAuctionsLoaded} loader={<div className="loadingBanner">{getLoadingElement()}</div>}>
                <ListGroup>
                    {auctionList}
                </ListGroup>
            </InfiniteScroll>
        </div>
    )
}

export default AuctionList