function Card({title,number,desc}){
    return (
        <div className="dashboard-card">

          <h3>
           {title}
          </h3>

          <p>
            {number}
          </p>

          <span>
            {desc}
          </span>

        </div>
    )
}
export default Card