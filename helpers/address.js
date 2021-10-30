module.exports = {
    shortenAddress: function(address){
        const len = address && address.length || 0;
        if(len > 0 )
            return address.substring(0, 5) + '...' + address.substring(len-4, len)
    }

}
